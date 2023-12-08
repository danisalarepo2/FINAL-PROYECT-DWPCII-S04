import mongoose from 'mongoose';
import validator from 'validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import uniqueValidator from 'mongoose-unique-validator';

import log from '../../config/winston';
import configKeys from '../../config/configKeys';
import MailSender from '../../services/mailSender';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastname: { type: String, required: true },
    grade: { type: String, required: true },
    section: { type: String, required: true },
    mail: {
      type: String,
      unique: true,
      required: [true, 'Es necesario ingresar email'],
      validate: {
        validator: (mail) => validator.isEmail(mail),
        message: '{VALUE} no es un email válido',
      },
    },
    password: {
      type: String,
      required: [true, 'Es necesario ingresar password'],
      trim: true,
      minLength: [6, 'El password debe tener al menos 6 caracteres'],
      // Resto de la validación...
    },
    code: {
      type: String,
      required: [true, 'Es necesario ingresar un código de estudiante'],
      trim: true,
      minLength: [
        9,
        'El código de estudiante debe tener al menos 9 caracteres',
      ],
      role: {
        type: String,
        enum: ['user', 'admin'],
        message: '{VALUE} no es un rol valido',
        default: 'user',
      },
      // Resto de la validación...
    },
    emailConfirmationToken: String,
    emailConfirmationAt: Date,
  },
  { timestamps: true },
);

UserSchema.plugin(uniqueValidator);

UserSchema.methods = {
  hashPassword() {
    return bcrypt.hashSync(this.password, 10);
  },
  generateConfirmationToken() {
    return crypto.randomBytes(32).toString('hex');
  },
  toJSON() {
    return {
      id: this._id,
      firstName: this.firstName,
      lastname: this.lastName,
      grade: this.grade,
      section: this.section,
      code: this.code,
      mail: this.mail,
      role: this.role,
      emailConfirmationToken: this.generateConfirmationToken(),
      emailConfirmationAt: this.emailConfirmationAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

UserSchema.pre('save', function presave(next) {
  if (this.isModified('password')) {
    this.password = this.hashPassword();
  }
  return next();
});

UserSchema.post('save', async function sendConfirmationMail() {
  // Creating Mail options
  const options = {
    host: configKeys.SMTP_HOST,
    port: configKeys.SMTP_PORT,
    secure: false,
    auth: {
      user: configKeys.MAIL_USERNAME,
      pass: configKeys.MAIL_PASSWORD,
    },
  };

  const mailSender = new MailSender(options);

  // Configuring mail data
  mailSender.mail = {
    from: 'bibliotec@gamadero.tecnm.mx',
    to: this.mail,
    subject: 'Confirmacion de Correo',
  };

  try {
    const info = await mailSender.sendMail(
      'confirmation',
      {
        user: this.firstName,
        lastname: this.lastname,
        mail: this.mail,
        token: this.emailConfirmationToken,
        host: configKeys.APP_URL,
      },
      `Estimado ${this.firstName} ${this.lastname} 
      para validar tu cuenta debes hacer clic en el siguiente
      enlace: ${configKeys.APP_URL}/user/confirm/${this.token}`,
    );

    if (!info) return log.info('😭 No se pudo enviar el correo');
    log.info('🎉 Correo enviado con exito');
    return info;
  } catch (error) {
    log.error(`🚨 ERROR al enviar correo: ${error.message}`);
    return null;
  }
});

export default mongoose.model('User', UserSchema);
