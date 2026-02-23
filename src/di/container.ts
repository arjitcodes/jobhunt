export class DIContainer {
  private services: Map<string, unknown>;
  private factories: Map<string, (container: DIContainer) => unknown>;

  constructor() {
    this.services = new Map();
    this.factories = new Map();
  }

  register<T>(name: string, implementation: T): void {
    if (implementation === undefined || implementation === null) {
      throw new Error(`Cannot register ${name}: Service is empty.`);
    }
    this.services.set(name, implementation);
  }

  registerFactory<T>(name: string, factoryFn: (container: DIContainer) => T): void {
    this.factories.set(name, factoryFn);
  }

  resolve<T>(name: string): T {
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    const factory = this.factories.get(name);
    if (factory) {
      const instance = factory(this) as T;
      this.services.set(name, instance); // Cache it for future use
      return instance;
    }

    throw new Error(`Service "${name}" not found in the container.`);
  }

  getServiceList(): string[] {
    return [...this.services.keys(), ...this.factories.keys()];
  }

  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }
}

export const container = new DIContainer();