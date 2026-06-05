import { IUser } from "../interfaces/User/IUser";
import { $apiUser } from "./AxiosInstances";


function decodeJwtPayload(token: string | null): any | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + (4 - normalizedPayload.length % 4) % 4,
      "="
    );
    const decodedPayload = decodeURIComponent(
      Array.prototype.map.call(
        atob(paddedPayload),
        (char: string) => `%${("00" + char.charCodeAt(0).toString(16)).slice(-2)}`
      ).join("")
    );

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.log("Could not decode JWT payload", error);
    return null;
  }
}


function getUserFromToken(): IUser | null {
  const payload = decodeJwtPayload(localStorage.getItem("accessToken"));
  if (!payload?.sub || !payload?.login || !payload?.role) return null;

  return {
    uuid: payload.sub,
    login: payload.login,
    email: payload.email ?? "",
    firstname: payload.firstname ?? "",
    lastname: payload.lastname ?? "",
    phone: payload.phone ?? "",
    role: payload.role,
  };
}


export default class UserService {
  static async getMe() {
    try {
      const response = await $apiUser.get<IUser>('/user/me/');
      return response.data;
    } catch {
      return getUserFromToken();
    }
  };
}
