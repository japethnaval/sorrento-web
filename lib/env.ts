const defaults = {
  apiUrl: "https://aax639heak.execute-api.ap-southeast-1.amazonaws.com",
  cognitoRegion: "ap-southeast-1",
  userPoolId: "ap-southeast-1_Ilv8RCHhZ",
  userPoolClientId: "2jpqi753v8tq2vstn9l8gk6594",
};

export function getPublicEnv() {
  return {
    apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? defaults.apiUrl).replace(
      /\/$/,
      "",
    ),
    cognitoRegion: process.env.NEXT_PUBLIC_COGNITO_REGION ?? defaults.cognitoRegion,
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID ?? defaults.userPoolId,
    userPoolClientId:
      process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ?? defaults.userPoolClientId,
  };
}
