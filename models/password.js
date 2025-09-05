import bcryptjs from "bcryptjs";

async function hash(password) {
  const saltRounds = getNumberOfRounds();
  const hashedPassword = await bcryptjs.hash(password, saltRounds);
  return hashedPassword;
}

function getNumberOfRounds() {
  let rounds = 1;

  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }

  return rounds;
}

async function compare(password, hashedPassword) {
  const isMatch = await bcryptjs.compare(password, hashedPassword);
  return isMatch;
}

const password = {
  hash,
  compare,
};

export default password;
