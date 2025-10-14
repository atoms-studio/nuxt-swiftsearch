import type { Cache, CacheEvents } from "@algolia/client-common";
import { useState } from "#app";

export const useAisStatefulCache = (key?: string) => {
  const options = { serializable: false };
  const cache = useState<Record<string, any>>(
    key ?? "swiftsearch_cache_stateful",
    () => ({}),
  );

  return {
    get<TValue>(
      key: object | string,
      defaultValue: () => Readonly<Promise<TValue>>,
      events: CacheEvents<TValue> = {
        miss: () => Promise.resolve(),
      },
    ): Readonly<Promise<TValue>> {
      const keyAsString = JSON.stringify(key);

      if (keyAsString in cache.value) {
        return Promise.resolve(
          options.serializable
            ? JSON.parse(cache.value[keyAsString])
            : cache.value[keyAsString],
        );
      }

      const promise = defaultValue();
      const miss = (events && events.miss) || (() => Promise.resolve());

      return promise.then((value: TValue) => miss(value)).then(() => promise);
    },

    set<TValue>(
      key: object | string,
      value: TValue,
    ): Readonly<Promise<TValue>> {
      cache.value[JSON.stringify(key)] = options.serializable
        ? JSON.stringify(value)
        : value;

      return Promise.resolve(value);
    },

    delete(key: object | string): Readonly<Promise<void>> {
      delete cache.value[JSON.stringify(key)];

      return Promise.resolve();
    },

    clear(): Readonly<Promise<void>> {
      cache.value = {};

      return Promise.resolve();
    },
  } as Cache;
};
