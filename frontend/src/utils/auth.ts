import { jwtDecode } from "jwt-decode";
import { User } from "~/types/auth";
import { TOKEN_STORAGE_KEY } from "~/utils/auth-context";
import storage from "~/utils/storage";

type TokenPayload = {
  IsAuthorized: string;
  email: string;
  exp: number;
  sid: string;
};

export const getUser = (): User | undefined => {
  const token = storage.get(TOKEN_STORAGE_KEY);

  if (!token) return;

  const payload = jwtDecode<TokenPayload>(token);

  if (!(Date.now() < payload?.exp * 1000)) return;

  return {
    id: payload.sid,
    email: payload.email,
    isAuthorized: payload.IsAuthorized === "True",
  };
};
