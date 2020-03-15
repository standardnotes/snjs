export const Challenges = {
  LocalPasscode: 1,
  AccountPassword: 2,
  Biometric: 3
};

export function challengeToString(challenge) {
  const mapping = {
    [Challenges.LocalPasscode]: 'application passcode',
    [Challenges.AccountPassword]: 'account password',
    [Challenges.Biometric]: 'biometrics',
  };
  return mapping[challenge];
}