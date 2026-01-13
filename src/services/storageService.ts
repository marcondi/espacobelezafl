// Base localStorage service with userId isolation
export class StorageService {
  private static getKey(userId: string, entity: string): string {
    return `financas_${userId}_${entity}`;
  }

  static get<T>(userId: string, entity: string): T | null {
    try {
      const data = localStorage.getItem(this.getKey(userId, entity));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static set<T>(userId: string, entity: string, data: T): void {
    try {
      localStorage.setItem(this.getKey(userId, entity), JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  static remove(userId: string, entity: string): void {
    try {
      localStorage.removeItem(this.getKey(userId, entity));
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear(userId: string): void {
    try {
      const keys = Object.keys(localStorage);
      const prefix = `financas_${userId}_`;
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
