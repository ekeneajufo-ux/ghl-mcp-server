import axios, { AxiosInstance, AxiosError } from "axios";

export class GHLClient {
  private http: AxiosInstance;
  public locationId?: string;

  constructor(apiKey: string, locationId?: string) {
    this.locationId = locationId;
    this.http = axios.create({
      baseURL: "https://rest.gohighlevel.com/v1",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async get<T = any>(path: string, params?: Record<string, any>): Promise<T> {
    try {
      const res = await this.http.get<T>(path, { params });
      return res.data;
    } catch (err) {
      throw this.formatError(err);
    }
  }

  async post<T = any>(path: string, data?: Record<string, any>): Promise<T> {
    try {
      const res = await this.http.post<T>(path, data);
      return res.data;
    } catch (err) {
      throw this.formatError(err);
    }
  }

  async put<T = any>(path: string, data?: Record<string, any>): Promise<T> {
    try {
      const res = await this.http.put<T>(path, data);
      return res.data;
    } catch (err) {
      throw this.formatError(err);
    }
  }

  async delete<T = any>(path: string): Promise<T> {
    try {
      const res = await this.http.delete<T>(path);
      return res.data;
    } catch (err) {
      throw this.formatError(err);
    }
  }

  private formatError(err: unknown): Error {
    if (err instanceof AxiosError && err.response) {
      const msg = err.response.data?.message ?? err.response.statusText;
      return new Error(`GHL API ${err.response.status}: ${msg}`);
    }
    return err instanceof Error ? err : new Error(String(err));
  }
}
