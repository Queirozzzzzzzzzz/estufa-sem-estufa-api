import password from "models/password";

async function hashPassword(unhashedPassword) {
  return await password.hash(unhashedPassword);
}

async function comparePasswords(providedPassword, passwordHash) {
  const passwordMatches = await password.compare(
    providedPassword,
    passwordHash
  );

  if (!passwordMatches) {
    throw new UnauthorizedError({
      message: `A senha informada não confere com a senha do usuário.`,
      action: `Verifique se a senha informada está correta e tente novamente.`,
      errorLocationCode:
        "MODEL:AUTHENTICATION:COMPARE_PASSWORDS:PASSWORD_MISMATCH",
    });
  }
}

export default {
  hashPassword,
  comparePasswords,
};
