import { SigfoxAPIClient } from "./client.js";

let client: SigfoxAPIClient | null = null;

export const getSigfoxClient = (login: string, password: string) => {
  if (client) {
    return client;
  }
  client = new SigfoxAPIClient(login, password);
  return client;
}
