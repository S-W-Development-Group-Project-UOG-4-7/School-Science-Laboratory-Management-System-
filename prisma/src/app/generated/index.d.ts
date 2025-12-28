
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Inventory
 * 
 */
export type Inventory = $Result.DefaultSelection<Prisma.$InventoryPayload>
/**
 * Model InventoryRequest
 * 
 */
export type InventoryRequest = $Result.DefaultSelection<Prisma.$InventoryRequestPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Category: {
  Glassware: 'Glassware',
  Equipment: 'Equipment',
  Chemicals: 'Chemicals',
  Safety: 'Safety',
  Instruments: 'Instruments'
};

export type Category = (typeof Category)[keyof typeof Category]


export const RequesterRole: {
  LAB_ASSISTANT: 'LAB_ASSISTANT',
  ADMIN: 'ADMIN'
};

export type RequesterRole = (typeof RequesterRole)[keyof typeof RequesterRole]


export const Urgency: {
  low: 'low',
  medium: 'medium',
  high: 'high'
};

export type Urgency = (typeof Urgency)[keyof typeof Urgency]


export const RequestStatus: {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected'
};

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus]

}

export type Category = $Enums.Category

export const Category: typeof $Enums.Category

export type RequesterRole = $Enums.RequesterRole

export const RequesterRole: typeof $Enums.RequesterRole

export type Urgency = $Enums.Urgency

export const Urgency: typeof $Enums.Urgency

export type RequestStatus = $Enums.RequestStatus

export const RequestStatus: typeof $Enums.RequestStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Inventories
 * const inventories = await prisma.inventory.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Inventories
   * const inventories = await prisma.inventory.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.inventory`: Exposes CRUD operations for the **Inventory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inventories
    * const inventories = await prisma.inventory.findMany()
    * ```
    */
  get inventory(): Prisma.InventoryDelegate<ExtArgs>;

  /**
   * `prisma.inventoryRequest`: Exposes CRUD operations for the **InventoryRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InventoryRequests
    * const inventoryRequests = await prisma.inventoryRequest.findMany()
    * ```
    */
  get inventoryRequest(): Prisma.InventoryRequestDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Inventory: 'Inventory',
    InventoryRequest: 'InventoryRequest'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "inventory" | "inventoryRequest"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Inventory: {
        payload: Prisma.$InventoryPayload<ExtArgs>
        fields: Prisma.InventoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload>
          }
          findFirst: {
            args: Prisma.InventoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload>
          }
          findMany: {
            args: Prisma.InventoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload>[]
          }
          create: {
            args: Prisma.InventoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload>
          }
          createMany: {
            args: Prisma.InventoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload>[]
          }
          delete: {
            args: Prisma.InventoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload>
          }
          update: {
            args: Prisma.InventoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload>
          }
          deleteMany: {
            args: Prisma.InventoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InventoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryPayload>
          }
          aggregate: {
            args: Prisma.InventoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventory>
          }
          groupBy: {
            args: Prisma.InventoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventoryCountArgs<ExtArgs>
            result: $Utils.Optional<InventoryCountAggregateOutputType> | number
          }
        }
      }
      InventoryRequest: {
        payload: Prisma.$InventoryRequestPayload<ExtArgs>
        fields: Prisma.InventoryRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventoryRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventoryRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload>
          }
          findFirst: {
            args: Prisma.InventoryRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventoryRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload>
          }
          findMany: {
            args: Prisma.InventoryRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload>[]
          }
          create: {
            args: Prisma.InventoryRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload>
          }
          createMany: {
            args: Prisma.InventoryRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventoryRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload>[]
          }
          delete: {
            args: Prisma.InventoryRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload>
          }
          update: {
            args: Prisma.InventoryRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload>
          }
          deleteMany: {
            args: Prisma.InventoryRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventoryRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InventoryRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryRequestPayload>
          }
          aggregate: {
            args: Prisma.InventoryRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventoryRequest>
          }
          groupBy: {
            args: Prisma.InventoryRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventoryRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventoryRequestCountArgs<ExtArgs>
            result: $Utils.Optional<InventoryRequestCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type InventoryCountOutputType
   */

  export type InventoryCountOutputType = {
    requests: number
  }

  export type InventoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requests?: boolean | InventoryCountOutputTypeCountRequestsArgs
  }

  // Custom InputTypes
  /**
   * InventoryCountOutputType without action
   */
  export type InventoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryCountOutputType
     */
    select?: InventoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InventoryCountOutputType without action
   */
  export type InventoryCountOutputTypeCountRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryRequestWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Inventory
   */

  export type AggregateInventory = {
    _count: InventoryCountAggregateOutputType | null
    _avg: InventoryAvgAggregateOutputType | null
    _sum: InventorySumAggregateOutputType | null
    _min: InventoryMinAggregateOutputType | null
    _max: InventoryMaxAggregateOutputType | null
  }

  export type InventoryAvgAggregateOutputType = {
    stockLevel: number | null
    minStockLevel: number | null
  }

  export type InventorySumAggregateOutputType = {
    stockLevel: number | null
    minStockLevel: number | null
  }

  export type InventoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    category: $Enums.Category | null
    stockLevel: number | null
    minStockLevel: number | null
    unit: string | null
    location: string | null
    photo: string | null
    storageInstructions: string | null
    handlingProcedure: string | null
    safetyNotes: string | null
    lastUpdated: Date | null
  }

  export type InventoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    category: $Enums.Category | null
    stockLevel: number | null
    minStockLevel: number | null
    unit: string | null
    location: string | null
    photo: string | null
    storageInstructions: string | null
    handlingProcedure: string | null
    safetyNotes: string | null
    lastUpdated: Date | null
  }

  export type InventoryCountAggregateOutputType = {
    id: number
    name: number
    category: number
    stockLevel: number
    minStockLevel: number
    unit: number
    location: number
    photo: number
    storageInstructions: number
    handlingProcedure: number
    safetyNotes: number
    lastUpdated: number
    _all: number
  }


  export type InventoryAvgAggregateInputType = {
    stockLevel?: true
    minStockLevel?: true
  }

  export type InventorySumAggregateInputType = {
    stockLevel?: true
    minStockLevel?: true
  }

  export type InventoryMinAggregateInputType = {
    id?: true
    name?: true
    category?: true
    stockLevel?: true
    minStockLevel?: true
    unit?: true
    location?: true
    photo?: true
    storageInstructions?: true
    handlingProcedure?: true
    safetyNotes?: true
    lastUpdated?: true
  }

  export type InventoryMaxAggregateInputType = {
    id?: true
    name?: true
    category?: true
    stockLevel?: true
    minStockLevel?: true
    unit?: true
    location?: true
    photo?: true
    storageInstructions?: true
    handlingProcedure?: true
    safetyNotes?: true
    lastUpdated?: true
  }

  export type InventoryCountAggregateInputType = {
    id?: true
    name?: true
    category?: true
    stockLevel?: true
    minStockLevel?: true
    unit?: true
    location?: true
    photo?: true
    storageInstructions?: true
    handlingProcedure?: true
    safetyNotes?: true
    lastUpdated?: true
    _all?: true
  }

  export type InventoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inventory to aggregate.
     */
    where?: InventoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inventories to fetch.
     */
    orderBy?: InventoryOrderByWithRelationInput | InventoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inventories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inventories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Inventories
    **/
    _count?: true | InventoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventoryMaxAggregateInputType
  }

  export type GetInventoryAggregateType<T extends InventoryAggregateArgs> = {
        [P in keyof T & keyof AggregateInventory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventory[P]>
      : GetScalarType<T[P], AggregateInventory[P]>
  }




  export type InventoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryWhereInput
    orderBy?: InventoryOrderByWithAggregationInput | InventoryOrderByWithAggregationInput[]
    by: InventoryScalarFieldEnum[] | InventoryScalarFieldEnum
    having?: InventoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventoryCountAggregateInputType | true
    _avg?: InventoryAvgAggregateInputType
    _sum?: InventorySumAggregateInputType
    _min?: InventoryMinAggregateInputType
    _max?: InventoryMaxAggregateInputType
  }

  export type InventoryGroupByOutputType = {
    id: string
    name: string
    category: $Enums.Category
    stockLevel: number
    minStockLevel: number
    unit: string
    location: string
    photo: string | null
    storageInstructions: string | null
    handlingProcedure: string | null
    safetyNotes: string | null
    lastUpdated: Date
    _count: InventoryCountAggregateOutputType | null
    _avg: InventoryAvgAggregateOutputType | null
    _sum: InventorySumAggregateOutputType | null
    _min: InventoryMinAggregateOutputType | null
    _max: InventoryMaxAggregateOutputType | null
  }

  type GetInventoryGroupByPayload<T extends InventoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventoryGroupByOutputType[P]>
            : GetScalarType<T[P], InventoryGroupByOutputType[P]>
        }
      >
    >


  export type InventorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    stockLevel?: boolean
    minStockLevel?: boolean
    unit?: boolean
    location?: boolean
    photo?: boolean
    storageInstructions?: boolean
    handlingProcedure?: boolean
    safetyNotes?: boolean
    lastUpdated?: boolean
    requests?: boolean | Inventory$requestsArgs<ExtArgs>
    _count?: boolean | InventoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventory"]>

  export type InventorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    category?: boolean
    stockLevel?: boolean
    minStockLevel?: boolean
    unit?: boolean
    location?: boolean
    photo?: boolean
    storageInstructions?: boolean
    handlingProcedure?: boolean
    safetyNotes?: boolean
    lastUpdated?: boolean
  }, ExtArgs["result"]["inventory"]>

  export type InventorySelectScalar = {
    id?: boolean
    name?: boolean
    category?: boolean
    stockLevel?: boolean
    minStockLevel?: boolean
    unit?: boolean
    location?: boolean
    photo?: boolean
    storageInstructions?: boolean
    handlingProcedure?: boolean
    safetyNotes?: boolean
    lastUpdated?: boolean
  }

  export type InventoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requests?: boolean | Inventory$requestsArgs<ExtArgs>
    _count?: boolean | InventoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InventoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $InventoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Inventory"
    objects: {
      requests: Prisma.$InventoryRequestPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      category: $Enums.Category
      stockLevel: number
      minStockLevel: number
      unit: string
      location: string
      photo: string | null
      storageInstructions: string | null
      handlingProcedure: string | null
      safetyNotes: string | null
      lastUpdated: Date
    }, ExtArgs["result"]["inventory"]>
    composites: {}
  }

  type InventoryGetPayload<S extends boolean | null | undefined | InventoryDefaultArgs> = $Result.GetResult<Prisma.$InventoryPayload, S>

  type InventoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InventoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InventoryCountAggregateInputType | true
    }

  export interface InventoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Inventory'], meta: { name: 'Inventory' } }
    /**
     * Find zero or one Inventory that matches the filter.
     * @param {InventoryFindUniqueArgs} args - Arguments to find a Inventory
     * @example
     * // Get one Inventory
     * const inventory = await prisma.inventory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventoryFindUniqueArgs>(args: SelectSubset<T, InventoryFindUniqueArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Inventory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InventoryFindUniqueOrThrowArgs} args - Arguments to find a Inventory
     * @example
     * // Get one Inventory
     * const inventory = await prisma.inventory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventoryFindUniqueOrThrowArgs>(args: SelectSubset<T, InventoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Inventory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryFindFirstArgs} args - Arguments to find a Inventory
     * @example
     * // Get one Inventory
     * const inventory = await prisma.inventory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventoryFindFirstArgs>(args?: SelectSubset<T, InventoryFindFirstArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Inventory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryFindFirstOrThrowArgs} args - Arguments to find a Inventory
     * @example
     * // Get one Inventory
     * const inventory = await prisma.inventory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventoryFindFirstOrThrowArgs>(args?: SelectSubset<T, InventoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Inventories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inventories
     * const inventories = await prisma.inventory.findMany()
     * 
     * // Get first 10 Inventories
     * const inventories = await prisma.inventory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventoryWithIdOnly = await prisma.inventory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventoryFindManyArgs>(args?: SelectSubset<T, InventoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Inventory.
     * @param {InventoryCreateArgs} args - Arguments to create a Inventory.
     * @example
     * // Create one Inventory
     * const Inventory = await prisma.inventory.create({
     *   data: {
     *     // ... data to create a Inventory
     *   }
     * })
     * 
     */
    create<T extends InventoryCreateArgs>(args: SelectSubset<T, InventoryCreateArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Inventories.
     * @param {InventoryCreateManyArgs} args - Arguments to create many Inventories.
     * @example
     * // Create many Inventories
     * const inventory = await prisma.inventory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventoryCreateManyArgs>(args?: SelectSubset<T, InventoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inventories and returns the data saved in the database.
     * @param {InventoryCreateManyAndReturnArgs} args - Arguments to create many Inventories.
     * @example
     * // Create many Inventories
     * const inventory = await prisma.inventory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inventories and only return the `id`
     * const inventoryWithIdOnly = await prisma.inventory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventoryCreateManyAndReturnArgs>(args?: SelectSubset<T, InventoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Inventory.
     * @param {InventoryDeleteArgs} args - Arguments to delete one Inventory.
     * @example
     * // Delete one Inventory
     * const Inventory = await prisma.inventory.delete({
     *   where: {
     *     // ... filter to delete one Inventory
     *   }
     * })
     * 
     */
    delete<T extends InventoryDeleteArgs>(args: SelectSubset<T, InventoryDeleteArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Inventory.
     * @param {InventoryUpdateArgs} args - Arguments to update one Inventory.
     * @example
     * // Update one Inventory
     * const inventory = await prisma.inventory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventoryUpdateArgs>(args: SelectSubset<T, InventoryUpdateArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Inventories.
     * @param {InventoryDeleteManyArgs} args - Arguments to filter Inventories to delete.
     * @example
     * // Delete a few Inventories
     * const { count } = await prisma.inventory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventoryDeleteManyArgs>(args?: SelectSubset<T, InventoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inventories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inventories
     * const inventory = await prisma.inventory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventoryUpdateManyArgs>(args: SelectSubset<T, InventoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Inventory.
     * @param {InventoryUpsertArgs} args - Arguments to update or create a Inventory.
     * @example
     * // Update or create a Inventory
     * const inventory = await prisma.inventory.upsert({
     *   create: {
     *     // ... data to create a Inventory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inventory we want to update
     *   }
     * })
     */
    upsert<T extends InventoryUpsertArgs>(args: SelectSubset<T, InventoryUpsertArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Inventories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryCountArgs} args - Arguments to filter Inventories to count.
     * @example
     * // Count the number of Inventories
     * const count = await prisma.inventory.count({
     *   where: {
     *     // ... the filter for the Inventories we want to count
     *   }
     * })
    **/
    count<T extends InventoryCountArgs>(
      args?: Subset<T, InventoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inventory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventoryAggregateArgs>(args: Subset<T, InventoryAggregateArgs>): Prisma.PrismaPromise<GetInventoryAggregateType<T>>

    /**
     * Group by Inventory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventoryGroupByArgs['orderBy'] }
        : { orderBy?: InventoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Inventory model
   */
  readonly fields: InventoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Inventory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    requests<T extends Inventory$requestsArgs<ExtArgs> = {}>(args?: Subset<T, Inventory$requestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Inventory model
   */ 
  interface InventoryFieldRefs {
    readonly id: FieldRef<"Inventory", 'String'>
    readonly name: FieldRef<"Inventory", 'String'>
    readonly category: FieldRef<"Inventory", 'Category'>
    readonly stockLevel: FieldRef<"Inventory", 'Int'>
    readonly minStockLevel: FieldRef<"Inventory", 'Int'>
    readonly unit: FieldRef<"Inventory", 'String'>
    readonly location: FieldRef<"Inventory", 'String'>
    readonly photo: FieldRef<"Inventory", 'String'>
    readonly storageInstructions: FieldRef<"Inventory", 'String'>
    readonly handlingProcedure: FieldRef<"Inventory", 'String'>
    readonly safetyNotes: FieldRef<"Inventory", 'String'>
    readonly lastUpdated: FieldRef<"Inventory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Inventory findUnique
   */
  export type InventoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * Filter, which Inventory to fetch.
     */
    where: InventoryWhereUniqueInput
  }

  /**
   * Inventory findUniqueOrThrow
   */
  export type InventoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * Filter, which Inventory to fetch.
     */
    where: InventoryWhereUniqueInput
  }

  /**
   * Inventory findFirst
   */
  export type InventoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * Filter, which Inventory to fetch.
     */
    where?: InventoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inventories to fetch.
     */
    orderBy?: InventoryOrderByWithRelationInput | InventoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inventories.
     */
    cursor?: InventoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inventories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inventories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inventories.
     */
    distinct?: InventoryScalarFieldEnum | InventoryScalarFieldEnum[]
  }

  /**
   * Inventory findFirstOrThrow
   */
  export type InventoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * Filter, which Inventory to fetch.
     */
    where?: InventoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inventories to fetch.
     */
    orderBy?: InventoryOrderByWithRelationInput | InventoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inventories.
     */
    cursor?: InventoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inventories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inventories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inventories.
     */
    distinct?: InventoryScalarFieldEnum | InventoryScalarFieldEnum[]
  }

  /**
   * Inventory findMany
   */
  export type InventoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * Filter, which Inventories to fetch.
     */
    where?: InventoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inventories to fetch.
     */
    orderBy?: InventoryOrderByWithRelationInput | InventoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Inventories.
     */
    cursor?: InventoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inventories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inventories.
     */
    skip?: number
    distinct?: InventoryScalarFieldEnum | InventoryScalarFieldEnum[]
  }

  /**
   * Inventory create
   */
  export type InventoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Inventory.
     */
    data: XOR<InventoryCreateInput, InventoryUncheckedCreateInput>
  }

  /**
   * Inventory createMany
   */
  export type InventoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Inventories.
     */
    data: InventoryCreateManyInput | InventoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Inventory createManyAndReturn
   */
  export type InventoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Inventories.
     */
    data: InventoryCreateManyInput | InventoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Inventory update
   */
  export type InventoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Inventory.
     */
    data: XOR<InventoryUpdateInput, InventoryUncheckedUpdateInput>
    /**
     * Choose, which Inventory to update.
     */
    where: InventoryWhereUniqueInput
  }

  /**
   * Inventory updateMany
   */
  export type InventoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Inventories.
     */
    data: XOR<InventoryUpdateManyMutationInput, InventoryUncheckedUpdateManyInput>
    /**
     * Filter which Inventories to update
     */
    where?: InventoryWhereInput
  }

  /**
   * Inventory upsert
   */
  export type InventoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Inventory to update in case it exists.
     */
    where: InventoryWhereUniqueInput
    /**
     * In case the Inventory found by the `where` argument doesn't exist, create a new Inventory with this data.
     */
    create: XOR<InventoryCreateInput, InventoryUncheckedCreateInput>
    /**
     * In case the Inventory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventoryUpdateInput, InventoryUncheckedUpdateInput>
  }

  /**
   * Inventory delete
   */
  export type InventoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
    /**
     * Filter which Inventory to delete.
     */
    where: InventoryWhereUniqueInput
  }

  /**
   * Inventory deleteMany
   */
  export type InventoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inventories to delete
     */
    where?: InventoryWhereInput
  }

  /**
   * Inventory.requests
   */
  export type Inventory$requestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    where?: InventoryRequestWhereInput
    orderBy?: InventoryRequestOrderByWithRelationInput | InventoryRequestOrderByWithRelationInput[]
    cursor?: InventoryRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InventoryRequestScalarFieldEnum | InventoryRequestScalarFieldEnum[]
  }

  /**
   * Inventory without action
   */
  export type InventoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventory
     */
    select?: InventorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryInclude<ExtArgs> | null
  }


  /**
   * Model InventoryRequest
   */

  export type AggregateInventoryRequest = {
    _count: InventoryRequestCountAggregateOutputType | null
    _avg: InventoryRequestAvgAggregateOutputType | null
    _sum: InventoryRequestSumAggregateOutputType | null
    _min: InventoryRequestMinAggregateOutputType | null
    _max: InventoryRequestMaxAggregateOutputType | null
  }

  export type InventoryRequestAvgAggregateOutputType = {
    quantity: number | null
  }

  export type InventoryRequestSumAggregateOutputType = {
    quantity: number | null
  }

  export type InventoryRequestMinAggregateOutputType = {
    id: string | null
    requesterName: string | null
    requesterRole: $Enums.RequesterRole | null
    requesterId: string | null
    itemId: string | null
    quantity: number | null
    reason: string | null
    urgency: $Enums.Urgency | null
    status: $Enums.RequestStatus | null
    requestDate: Date | null
    responseDate: Date | null
    responseNote: string | null
  }

  export type InventoryRequestMaxAggregateOutputType = {
    id: string | null
    requesterName: string | null
    requesterRole: $Enums.RequesterRole | null
    requesterId: string | null
    itemId: string | null
    quantity: number | null
    reason: string | null
    urgency: $Enums.Urgency | null
    status: $Enums.RequestStatus | null
    requestDate: Date | null
    responseDate: Date | null
    responseNote: string | null
  }

  export type InventoryRequestCountAggregateOutputType = {
    id: number
    requesterName: number
    requesterRole: number
    requesterId: number
    itemId: number
    quantity: number
    reason: number
    urgency: number
    status: number
    requestDate: number
    responseDate: number
    responseNote: number
    _all: number
  }


  export type InventoryRequestAvgAggregateInputType = {
    quantity?: true
  }

  export type InventoryRequestSumAggregateInputType = {
    quantity?: true
  }

  export type InventoryRequestMinAggregateInputType = {
    id?: true
    requesterName?: true
    requesterRole?: true
    requesterId?: true
    itemId?: true
    quantity?: true
    reason?: true
    urgency?: true
    status?: true
    requestDate?: true
    responseDate?: true
    responseNote?: true
  }

  export type InventoryRequestMaxAggregateInputType = {
    id?: true
    requesterName?: true
    requesterRole?: true
    requesterId?: true
    itemId?: true
    quantity?: true
    reason?: true
    urgency?: true
    status?: true
    requestDate?: true
    responseDate?: true
    responseNote?: true
  }

  export type InventoryRequestCountAggregateInputType = {
    id?: true
    requesterName?: true
    requesterRole?: true
    requesterId?: true
    itemId?: true
    quantity?: true
    reason?: true
    urgency?: true
    status?: true
    requestDate?: true
    responseDate?: true
    responseNote?: true
    _all?: true
  }

  export type InventoryRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryRequest to aggregate.
     */
    where?: InventoryRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryRequests to fetch.
     */
    orderBy?: InventoryRequestOrderByWithRelationInput | InventoryRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventoryRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InventoryRequests
    **/
    _count?: true | InventoryRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventoryRequestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventoryRequestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventoryRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventoryRequestMaxAggregateInputType
  }

  export type GetInventoryRequestAggregateType<T extends InventoryRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateInventoryRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventoryRequest[P]>
      : GetScalarType<T[P], AggregateInventoryRequest[P]>
  }




  export type InventoryRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryRequestWhereInput
    orderBy?: InventoryRequestOrderByWithAggregationInput | InventoryRequestOrderByWithAggregationInput[]
    by: InventoryRequestScalarFieldEnum[] | InventoryRequestScalarFieldEnum
    having?: InventoryRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventoryRequestCountAggregateInputType | true
    _avg?: InventoryRequestAvgAggregateInputType
    _sum?: InventoryRequestSumAggregateInputType
    _min?: InventoryRequestMinAggregateInputType
    _max?: InventoryRequestMaxAggregateInputType
  }

  export type InventoryRequestGroupByOutputType = {
    id: string
    requesterName: string
    requesterRole: $Enums.RequesterRole
    requesterId: string
    itemId: string
    quantity: number
    reason: string
    urgency: $Enums.Urgency
    status: $Enums.RequestStatus
    requestDate: Date
    responseDate: Date | null
    responseNote: string | null
    _count: InventoryRequestCountAggregateOutputType | null
    _avg: InventoryRequestAvgAggregateOutputType | null
    _sum: InventoryRequestSumAggregateOutputType | null
    _min: InventoryRequestMinAggregateOutputType | null
    _max: InventoryRequestMaxAggregateOutputType | null
  }

  type GetInventoryRequestGroupByPayload<T extends InventoryRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventoryRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventoryRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventoryRequestGroupByOutputType[P]>
            : GetScalarType<T[P], InventoryRequestGroupByOutputType[P]>
        }
      >
    >


  export type InventoryRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requesterName?: boolean
    requesterRole?: boolean
    requesterId?: boolean
    itemId?: boolean
    quantity?: boolean
    reason?: boolean
    urgency?: boolean
    status?: boolean
    requestDate?: boolean
    responseDate?: boolean
    responseNote?: boolean
    item?: boolean | InventoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryRequest"]>

  export type InventoryRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requesterName?: boolean
    requesterRole?: boolean
    requesterId?: boolean
    itemId?: boolean
    quantity?: boolean
    reason?: boolean
    urgency?: boolean
    status?: boolean
    requestDate?: boolean
    responseDate?: boolean
    responseNote?: boolean
    item?: boolean | InventoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryRequest"]>

  export type InventoryRequestSelectScalar = {
    id?: boolean
    requesterName?: boolean
    requesterRole?: boolean
    requesterId?: boolean
    itemId?: boolean
    quantity?: boolean
    reason?: boolean
    urgency?: boolean
    status?: boolean
    requestDate?: boolean
    responseDate?: boolean
    responseNote?: boolean
  }

  export type InventoryRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryDefaultArgs<ExtArgs>
  }
  export type InventoryRequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryDefaultArgs<ExtArgs>
  }

  export type $InventoryRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InventoryRequest"
    objects: {
      item: Prisma.$InventoryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      requesterName: string
      requesterRole: $Enums.RequesterRole
      requesterId: string
      itemId: string
      quantity: number
      reason: string
      urgency: $Enums.Urgency
      status: $Enums.RequestStatus
      requestDate: Date
      responseDate: Date | null
      responseNote: string | null
    }, ExtArgs["result"]["inventoryRequest"]>
    composites: {}
  }

  type InventoryRequestGetPayload<S extends boolean | null | undefined | InventoryRequestDefaultArgs> = $Result.GetResult<Prisma.$InventoryRequestPayload, S>

  type InventoryRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InventoryRequestFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InventoryRequestCountAggregateInputType | true
    }

  export interface InventoryRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InventoryRequest'], meta: { name: 'InventoryRequest' } }
    /**
     * Find zero or one InventoryRequest that matches the filter.
     * @param {InventoryRequestFindUniqueArgs} args - Arguments to find a InventoryRequest
     * @example
     * // Get one InventoryRequest
     * const inventoryRequest = await prisma.inventoryRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventoryRequestFindUniqueArgs>(args: SelectSubset<T, InventoryRequestFindUniqueArgs<ExtArgs>>): Prisma__InventoryRequestClient<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InventoryRequest that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InventoryRequestFindUniqueOrThrowArgs} args - Arguments to find a InventoryRequest
     * @example
     * // Get one InventoryRequest
     * const inventoryRequest = await prisma.inventoryRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventoryRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, InventoryRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventoryRequestClient<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InventoryRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryRequestFindFirstArgs} args - Arguments to find a InventoryRequest
     * @example
     * // Get one InventoryRequest
     * const inventoryRequest = await prisma.inventoryRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventoryRequestFindFirstArgs>(args?: SelectSubset<T, InventoryRequestFindFirstArgs<ExtArgs>>): Prisma__InventoryRequestClient<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InventoryRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryRequestFindFirstOrThrowArgs} args - Arguments to find a InventoryRequest
     * @example
     * // Get one InventoryRequest
     * const inventoryRequest = await prisma.inventoryRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventoryRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, InventoryRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventoryRequestClient<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InventoryRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InventoryRequests
     * const inventoryRequests = await prisma.inventoryRequest.findMany()
     * 
     * // Get first 10 InventoryRequests
     * const inventoryRequests = await prisma.inventoryRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventoryRequestWithIdOnly = await prisma.inventoryRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventoryRequestFindManyArgs>(args?: SelectSubset<T, InventoryRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InventoryRequest.
     * @param {InventoryRequestCreateArgs} args - Arguments to create a InventoryRequest.
     * @example
     * // Create one InventoryRequest
     * const InventoryRequest = await prisma.inventoryRequest.create({
     *   data: {
     *     // ... data to create a InventoryRequest
     *   }
     * })
     * 
     */
    create<T extends InventoryRequestCreateArgs>(args: SelectSubset<T, InventoryRequestCreateArgs<ExtArgs>>): Prisma__InventoryRequestClient<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InventoryRequests.
     * @param {InventoryRequestCreateManyArgs} args - Arguments to create many InventoryRequests.
     * @example
     * // Create many InventoryRequests
     * const inventoryRequest = await prisma.inventoryRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventoryRequestCreateManyArgs>(args?: SelectSubset<T, InventoryRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InventoryRequests and returns the data saved in the database.
     * @param {InventoryRequestCreateManyAndReturnArgs} args - Arguments to create many InventoryRequests.
     * @example
     * // Create many InventoryRequests
     * const inventoryRequest = await prisma.inventoryRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InventoryRequests and only return the `id`
     * const inventoryRequestWithIdOnly = await prisma.inventoryRequest.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventoryRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, InventoryRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InventoryRequest.
     * @param {InventoryRequestDeleteArgs} args - Arguments to delete one InventoryRequest.
     * @example
     * // Delete one InventoryRequest
     * const InventoryRequest = await prisma.inventoryRequest.delete({
     *   where: {
     *     // ... filter to delete one InventoryRequest
     *   }
     * })
     * 
     */
    delete<T extends InventoryRequestDeleteArgs>(args: SelectSubset<T, InventoryRequestDeleteArgs<ExtArgs>>): Prisma__InventoryRequestClient<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InventoryRequest.
     * @param {InventoryRequestUpdateArgs} args - Arguments to update one InventoryRequest.
     * @example
     * // Update one InventoryRequest
     * const inventoryRequest = await prisma.inventoryRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventoryRequestUpdateArgs>(args: SelectSubset<T, InventoryRequestUpdateArgs<ExtArgs>>): Prisma__InventoryRequestClient<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InventoryRequests.
     * @param {InventoryRequestDeleteManyArgs} args - Arguments to filter InventoryRequests to delete.
     * @example
     * // Delete a few InventoryRequests
     * const { count } = await prisma.inventoryRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventoryRequestDeleteManyArgs>(args?: SelectSubset<T, InventoryRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InventoryRequests
     * const inventoryRequest = await prisma.inventoryRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventoryRequestUpdateManyArgs>(args: SelectSubset<T, InventoryRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InventoryRequest.
     * @param {InventoryRequestUpsertArgs} args - Arguments to update or create a InventoryRequest.
     * @example
     * // Update or create a InventoryRequest
     * const inventoryRequest = await prisma.inventoryRequest.upsert({
     *   create: {
     *     // ... data to create a InventoryRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InventoryRequest we want to update
     *   }
     * })
     */
    upsert<T extends InventoryRequestUpsertArgs>(args: SelectSubset<T, InventoryRequestUpsertArgs<ExtArgs>>): Prisma__InventoryRequestClient<$Result.GetResult<Prisma.$InventoryRequestPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InventoryRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryRequestCountArgs} args - Arguments to filter InventoryRequests to count.
     * @example
     * // Count the number of InventoryRequests
     * const count = await prisma.inventoryRequest.count({
     *   where: {
     *     // ... the filter for the InventoryRequests we want to count
     *   }
     * })
    **/
    count<T extends InventoryRequestCountArgs>(
      args?: Subset<T, InventoryRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventoryRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InventoryRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventoryRequestAggregateArgs>(args: Subset<T, InventoryRequestAggregateArgs>): Prisma.PrismaPromise<GetInventoryRequestAggregateType<T>>

    /**
     * Group by InventoryRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryRequestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventoryRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventoryRequestGroupByArgs['orderBy'] }
        : { orderBy?: InventoryRequestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventoryRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventoryRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InventoryRequest model
   */
  readonly fields: InventoryRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InventoryRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventoryRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    item<T extends InventoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InventoryDefaultArgs<ExtArgs>>): Prisma__InventoryClient<$Result.GetResult<Prisma.$InventoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InventoryRequest model
   */ 
  interface InventoryRequestFieldRefs {
    readonly id: FieldRef<"InventoryRequest", 'String'>
    readonly requesterName: FieldRef<"InventoryRequest", 'String'>
    readonly requesterRole: FieldRef<"InventoryRequest", 'RequesterRole'>
    readonly requesterId: FieldRef<"InventoryRequest", 'String'>
    readonly itemId: FieldRef<"InventoryRequest", 'String'>
    readonly quantity: FieldRef<"InventoryRequest", 'Int'>
    readonly reason: FieldRef<"InventoryRequest", 'String'>
    readonly urgency: FieldRef<"InventoryRequest", 'Urgency'>
    readonly status: FieldRef<"InventoryRequest", 'RequestStatus'>
    readonly requestDate: FieldRef<"InventoryRequest", 'DateTime'>
    readonly responseDate: FieldRef<"InventoryRequest", 'DateTime'>
    readonly responseNote: FieldRef<"InventoryRequest", 'String'>
  }
    

  // Custom InputTypes
  /**
   * InventoryRequest findUnique
   */
  export type InventoryRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * Filter, which InventoryRequest to fetch.
     */
    where: InventoryRequestWhereUniqueInput
  }

  /**
   * InventoryRequest findUniqueOrThrow
   */
  export type InventoryRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * Filter, which InventoryRequest to fetch.
     */
    where: InventoryRequestWhereUniqueInput
  }

  /**
   * InventoryRequest findFirst
   */
  export type InventoryRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * Filter, which InventoryRequest to fetch.
     */
    where?: InventoryRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryRequests to fetch.
     */
    orderBy?: InventoryRequestOrderByWithRelationInput | InventoryRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryRequests.
     */
    cursor?: InventoryRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryRequests.
     */
    distinct?: InventoryRequestScalarFieldEnum | InventoryRequestScalarFieldEnum[]
  }

  /**
   * InventoryRequest findFirstOrThrow
   */
  export type InventoryRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * Filter, which InventoryRequest to fetch.
     */
    where?: InventoryRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryRequests to fetch.
     */
    orderBy?: InventoryRequestOrderByWithRelationInput | InventoryRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryRequests.
     */
    cursor?: InventoryRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryRequests.
     */
    distinct?: InventoryRequestScalarFieldEnum | InventoryRequestScalarFieldEnum[]
  }

  /**
   * InventoryRequest findMany
   */
  export type InventoryRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * Filter, which InventoryRequests to fetch.
     */
    where?: InventoryRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryRequests to fetch.
     */
    orderBy?: InventoryRequestOrderByWithRelationInput | InventoryRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InventoryRequests.
     */
    cursor?: InventoryRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryRequests.
     */
    skip?: number
    distinct?: InventoryRequestScalarFieldEnum | InventoryRequestScalarFieldEnum[]
  }

  /**
   * InventoryRequest create
   */
  export type InventoryRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a InventoryRequest.
     */
    data: XOR<InventoryRequestCreateInput, InventoryRequestUncheckedCreateInput>
  }

  /**
   * InventoryRequest createMany
   */
  export type InventoryRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InventoryRequests.
     */
    data: InventoryRequestCreateManyInput | InventoryRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryRequest createManyAndReturn
   */
  export type InventoryRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InventoryRequests.
     */
    data: InventoryRequestCreateManyInput | InventoryRequestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InventoryRequest update
   */
  export type InventoryRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a InventoryRequest.
     */
    data: XOR<InventoryRequestUpdateInput, InventoryRequestUncheckedUpdateInput>
    /**
     * Choose, which InventoryRequest to update.
     */
    where: InventoryRequestWhereUniqueInput
  }

  /**
   * InventoryRequest updateMany
   */
  export type InventoryRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InventoryRequests.
     */
    data: XOR<InventoryRequestUpdateManyMutationInput, InventoryRequestUncheckedUpdateManyInput>
    /**
     * Filter which InventoryRequests to update
     */
    where?: InventoryRequestWhereInput
  }

  /**
   * InventoryRequest upsert
   */
  export type InventoryRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the InventoryRequest to update in case it exists.
     */
    where: InventoryRequestWhereUniqueInput
    /**
     * In case the InventoryRequest found by the `where` argument doesn't exist, create a new InventoryRequest with this data.
     */
    create: XOR<InventoryRequestCreateInput, InventoryRequestUncheckedCreateInput>
    /**
     * In case the InventoryRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventoryRequestUpdateInput, InventoryRequestUncheckedUpdateInput>
  }

  /**
   * InventoryRequest delete
   */
  export type InventoryRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
    /**
     * Filter which InventoryRequest to delete.
     */
    where: InventoryRequestWhereUniqueInput
  }

  /**
   * InventoryRequest deleteMany
   */
  export type InventoryRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryRequests to delete
     */
    where?: InventoryRequestWhereInput
  }

  /**
   * InventoryRequest without action
   */
  export type InventoryRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryRequest
     */
    select?: InventoryRequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryRequestInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const InventoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    category: 'category',
    stockLevel: 'stockLevel',
    minStockLevel: 'minStockLevel',
    unit: 'unit',
    location: 'location',
    photo: 'photo',
    storageInstructions: 'storageInstructions',
    handlingProcedure: 'handlingProcedure',
    safetyNotes: 'safetyNotes',
    lastUpdated: 'lastUpdated'
  };

  export type InventoryScalarFieldEnum = (typeof InventoryScalarFieldEnum)[keyof typeof InventoryScalarFieldEnum]


  export const InventoryRequestScalarFieldEnum: {
    id: 'id',
    requesterName: 'requesterName',
    requesterRole: 'requesterRole',
    requesterId: 'requesterId',
    itemId: 'itemId',
    quantity: 'quantity',
    reason: 'reason',
    urgency: 'urgency',
    status: 'status',
    requestDate: 'requestDate',
    responseDate: 'responseDate',
    responseNote: 'responseNote'
  };

  export type InventoryRequestScalarFieldEnum = (typeof InventoryRequestScalarFieldEnum)[keyof typeof InventoryRequestScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Category'
   */
  export type EnumCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Category'>
    


  /**
   * Reference to a field of type 'Category[]'
   */
  export type ListEnumCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Category[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'RequesterRole'
   */
  export type EnumRequesterRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RequesterRole'>
    


  /**
   * Reference to a field of type 'RequesterRole[]'
   */
  export type ListEnumRequesterRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RequesterRole[]'>
    


  /**
   * Reference to a field of type 'Urgency'
   */
  export type EnumUrgencyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Urgency'>
    


  /**
   * Reference to a field of type 'Urgency[]'
   */
  export type ListEnumUrgencyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Urgency[]'>
    


  /**
   * Reference to a field of type 'RequestStatus'
   */
  export type EnumRequestStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RequestStatus'>
    


  /**
   * Reference to a field of type 'RequestStatus[]'
   */
  export type ListEnumRequestStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RequestStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type InventoryWhereInput = {
    AND?: InventoryWhereInput | InventoryWhereInput[]
    OR?: InventoryWhereInput[]
    NOT?: InventoryWhereInput | InventoryWhereInput[]
    id?: StringFilter<"Inventory"> | string
    name?: StringFilter<"Inventory"> | string
    category?: EnumCategoryFilter<"Inventory"> | $Enums.Category
    stockLevel?: IntFilter<"Inventory"> | number
    minStockLevel?: IntFilter<"Inventory"> | number
    unit?: StringFilter<"Inventory"> | string
    location?: StringFilter<"Inventory"> | string
    photo?: StringNullableFilter<"Inventory"> | string | null
    storageInstructions?: StringNullableFilter<"Inventory"> | string | null
    handlingProcedure?: StringNullableFilter<"Inventory"> | string | null
    safetyNotes?: StringNullableFilter<"Inventory"> | string | null
    lastUpdated?: DateTimeFilter<"Inventory"> | Date | string
    requests?: InventoryRequestListRelationFilter
  }

  export type InventoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    stockLevel?: SortOrder
    minStockLevel?: SortOrder
    unit?: SortOrder
    location?: SortOrder
    photo?: SortOrderInput | SortOrder
    storageInstructions?: SortOrderInput | SortOrder
    handlingProcedure?: SortOrderInput | SortOrder
    safetyNotes?: SortOrderInput | SortOrder
    lastUpdated?: SortOrder
    requests?: InventoryRequestOrderByRelationAggregateInput
  }

  export type InventoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InventoryWhereInput | InventoryWhereInput[]
    OR?: InventoryWhereInput[]
    NOT?: InventoryWhereInput | InventoryWhereInput[]
    name?: StringFilter<"Inventory"> | string
    category?: EnumCategoryFilter<"Inventory"> | $Enums.Category
    stockLevel?: IntFilter<"Inventory"> | number
    minStockLevel?: IntFilter<"Inventory"> | number
    unit?: StringFilter<"Inventory"> | string
    location?: StringFilter<"Inventory"> | string
    photo?: StringNullableFilter<"Inventory"> | string | null
    storageInstructions?: StringNullableFilter<"Inventory"> | string | null
    handlingProcedure?: StringNullableFilter<"Inventory"> | string | null
    safetyNotes?: StringNullableFilter<"Inventory"> | string | null
    lastUpdated?: DateTimeFilter<"Inventory"> | Date | string
    requests?: InventoryRequestListRelationFilter
  }, "id">

  export type InventoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    stockLevel?: SortOrder
    minStockLevel?: SortOrder
    unit?: SortOrder
    location?: SortOrder
    photo?: SortOrderInput | SortOrder
    storageInstructions?: SortOrderInput | SortOrder
    handlingProcedure?: SortOrderInput | SortOrder
    safetyNotes?: SortOrderInput | SortOrder
    lastUpdated?: SortOrder
    _count?: InventoryCountOrderByAggregateInput
    _avg?: InventoryAvgOrderByAggregateInput
    _max?: InventoryMaxOrderByAggregateInput
    _min?: InventoryMinOrderByAggregateInput
    _sum?: InventorySumOrderByAggregateInput
  }

  export type InventoryScalarWhereWithAggregatesInput = {
    AND?: InventoryScalarWhereWithAggregatesInput | InventoryScalarWhereWithAggregatesInput[]
    OR?: InventoryScalarWhereWithAggregatesInput[]
    NOT?: InventoryScalarWhereWithAggregatesInput | InventoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Inventory"> | string
    name?: StringWithAggregatesFilter<"Inventory"> | string
    category?: EnumCategoryWithAggregatesFilter<"Inventory"> | $Enums.Category
    stockLevel?: IntWithAggregatesFilter<"Inventory"> | number
    minStockLevel?: IntWithAggregatesFilter<"Inventory"> | number
    unit?: StringWithAggregatesFilter<"Inventory"> | string
    location?: StringWithAggregatesFilter<"Inventory"> | string
    photo?: StringNullableWithAggregatesFilter<"Inventory"> | string | null
    storageInstructions?: StringNullableWithAggregatesFilter<"Inventory"> | string | null
    handlingProcedure?: StringNullableWithAggregatesFilter<"Inventory"> | string | null
    safetyNotes?: StringNullableWithAggregatesFilter<"Inventory"> | string | null
    lastUpdated?: DateTimeWithAggregatesFilter<"Inventory"> | Date | string
  }

  export type InventoryRequestWhereInput = {
    AND?: InventoryRequestWhereInput | InventoryRequestWhereInput[]
    OR?: InventoryRequestWhereInput[]
    NOT?: InventoryRequestWhereInput | InventoryRequestWhereInput[]
    id?: StringFilter<"InventoryRequest"> | string
    requesterName?: StringFilter<"InventoryRequest"> | string
    requesterRole?: EnumRequesterRoleFilter<"InventoryRequest"> | $Enums.RequesterRole
    requesterId?: StringFilter<"InventoryRequest"> | string
    itemId?: StringFilter<"InventoryRequest"> | string
    quantity?: IntFilter<"InventoryRequest"> | number
    reason?: StringFilter<"InventoryRequest"> | string
    urgency?: EnumUrgencyFilter<"InventoryRequest"> | $Enums.Urgency
    status?: EnumRequestStatusFilter<"InventoryRequest"> | $Enums.RequestStatus
    requestDate?: DateTimeFilter<"InventoryRequest"> | Date | string
    responseDate?: DateTimeNullableFilter<"InventoryRequest"> | Date | string | null
    responseNote?: StringNullableFilter<"InventoryRequest"> | string | null
    item?: XOR<InventoryRelationFilter, InventoryWhereInput>
  }

  export type InventoryRequestOrderByWithRelationInput = {
    id?: SortOrder
    requesterName?: SortOrder
    requesterRole?: SortOrder
    requesterId?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    reason?: SortOrder
    urgency?: SortOrder
    status?: SortOrder
    requestDate?: SortOrder
    responseDate?: SortOrderInput | SortOrder
    responseNote?: SortOrderInput | SortOrder
    item?: InventoryOrderByWithRelationInput
  }

  export type InventoryRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InventoryRequestWhereInput | InventoryRequestWhereInput[]
    OR?: InventoryRequestWhereInput[]
    NOT?: InventoryRequestWhereInput | InventoryRequestWhereInput[]
    requesterName?: StringFilter<"InventoryRequest"> | string
    requesterRole?: EnumRequesterRoleFilter<"InventoryRequest"> | $Enums.RequesterRole
    requesterId?: StringFilter<"InventoryRequest"> | string
    itemId?: StringFilter<"InventoryRequest"> | string
    quantity?: IntFilter<"InventoryRequest"> | number
    reason?: StringFilter<"InventoryRequest"> | string
    urgency?: EnumUrgencyFilter<"InventoryRequest"> | $Enums.Urgency
    status?: EnumRequestStatusFilter<"InventoryRequest"> | $Enums.RequestStatus
    requestDate?: DateTimeFilter<"InventoryRequest"> | Date | string
    responseDate?: DateTimeNullableFilter<"InventoryRequest"> | Date | string | null
    responseNote?: StringNullableFilter<"InventoryRequest"> | string | null
    item?: XOR<InventoryRelationFilter, InventoryWhereInput>
  }, "id">

  export type InventoryRequestOrderByWithAggregationInput = {
    id?: SortOrder
    requesterName?: SortOrder
    requesterRole?: SortOrder
    requesterId?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    reason?: SortOrder
    urgency?: SortOrder
    status?: SortOrder
    requestDate?: SortOrder
    responseDate?: SortOrderInput | SortOrder
    responseNote?: SortOrderInput | SortOrder
    _count?: InventoryRequestCountOrderByAggregateInput
    _avg?: InventoryRequestAvgOrderByAggregateInput
    _max?: InventoryRequestMaxOrderByAggregateInput
    _min?: InventoryRequestMinOrderByAggregateInput
    _sum?: InventoryRequestSumOrderByAggregateInput
  }

  export type InventoryRequestScalarWhereWithAggregatesInput = {
    AND?: InventoryRequestScalarWhereWithAggregatesInput | InventoryRequestScalarWhereWithAggregatesInput[]
    OR?: InventoryRequestScalarWhereWithAggregatesInput[]
    NOT?: InventoryRequestScalarWhereWithAggregatesInput | InventoryRequestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InventoryRequest"> | string
    requesterName?: StringWithAggregatesFilter<"InventoryRequest"> | string
    requesterRole?: EnumRequesterRoleWithAggregatesFilter<"InventoryRequest"> | $Enums.RequesterRole
    requesterId?: StringWithAggregatesFilter<"InventoryRequest"> | string
    itemId?: StringWithAggregatesFilter<"InventoryRequest"> | string
    quantity?: IntWithAggregatesFilter<"InventoryRequest"> | number
    reason?: StringWithAggregatesFilter<"InventoryRequest"> | string
    urgency?: EnumUrgencyWithAggregatesFilter<"InventoryRequest"> | $Enums.Urgency
    status?: EnumRequestStatusWithAggregatesFilter<"InventoryRequest"> | $Enums.RequestStatus
    requestDate?: DateTimeWithAggregatesFilter<"InventoryRequest"> | Date | string
    responseDate?: DateTimeNullableWithAggregatesFilter<"InventoryRequest"> | Date | string | null
    responseNote?: StringNullableWithAggregatesFilter<"InventoryRequest"> | string | null
  }

  export type InventoryCreateInput = {
    id?: string
    name: string
    category: $Enums.Category
    stockLevel: number
    minStockLevel: number
    unit: string
    location: string
    photo?: string | null
    storageInstructions?: string | null
    handlingProcedure?: string | null
    safetyNotes?: string | null
    lastUpdated?: Date | string
    requests?: InventoryRequestCreateNestedManyWithoutItemInput
  }

  export type InventoryUncheckedCreateInput = {
    id?: string
    name: string
    category: $Enums.Category
    stockLevel: number
    minStockLevel: number
    unit: string
    location: string
    photo?: string | null
    storageInstructions?: string | null
    handlingProcedure?: string | null
    safetyNotes?: string | null
    lastUpdated?: Date | string
    requests?: InventoryRequestUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    stockLevel?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    photo?: NullableStringFieldUpdateOperationsInput | string | null
    storageInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    handlingProcedure?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    requests?: InventoryRequestUpdateManyWithoutItemNestedInput
  }

  export type InventoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    stockLevel?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    photo?: NullableStringFieldUpdateOperationsInput | string | null
    storageInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    handlingProcedure?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    requests?: InventoryRequestUncheckedUpdateManyWithoutItemNestedInput
  }

  export type InventoryCreateManyInput = {
    id?: string
    name: string
    category: $Enums.Category
    stockLevel: number
    minStockLevel: number
    unit: string
    location: string
    photo?: string | null
    storageInstructions?: string | null
    handlingProcedure?: string | null
    safetyNotes?: string | null
    lastUpdated?: Date | string
  }

  export type InventoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    stockLevel?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    photo?: NullableStringFieldUpdateOperationsInput | string | null
    storageInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    handlingProcedure?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    stockLevel?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    photo?: NullableStringFieldUpdateOperationsInput | string | null
    storageInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    handlingProcedure?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryRequestCreateInput = {
    id?: string
    requesterName: string
    requesterRole: $Enums.RequesterRole
    requesterId: string
    quantity: number
    reason: string
    urgency: $Enums.Urgency
    status?: $Enums.RequestStatus
    requestDate?: Date | string
    responseDate?: Date | string | null
    responseNote?: string | null
    item: InventoryCreateNestedOneWithoutRequestsInput
  }

  export type InventoryRequestUncheckedCreateInput = {
    id?: string
    requesterName: string
    requesterRole: $Enums.RequesterRole
    requesterId: string
    itemId: string
    quantity: number
    reason: string
    urgency: $Enums.Urgency
    status?: $Enums.RequestStatus
    requestDate?: Date | string
    responseDate?: Date | string | null
    responseNote?: string | null
  }

  export type InventoryRequestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requesterName?: StringFieldUpdateOperationsInput | string
    requesterRole?: EnumRequesterRoleFieldUpdateOperationsInput | $Enums.RequesterRole
    requesterId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    reason?: StringFieldUpdateOperationsInput | string
    urgency?: EnumUrgencyFieldUpdateOperationsInput | $Enums.Urgency
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    requestDate?: DateTimeFieldUpdateOperationsInput | Date | string
    responseDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responseNote?: NullableStringFieldUpdateOperationsInput | string | null
    item?: InventoryUpdateOneRequiredWithoutRequestsNestedInput
  }

  export type InventoryRequestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requesterName?: StringFieldUpdateOperationsInput | string
    requesterRole?: EnumRequesterRoleFieldUpdateOperationsInput | $Enums.RequesterRole
    requesterId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    reason?: StringFieldUpdateOperationsInput | string
    urgency?: EnumUrgencyFieldUpdateOperationsInput | $Enums.Urgency
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    requestDate?: DateTimeFieldUpdateOperationsInput | Date | string
    responseDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responseNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type InventoryRequestCreateManyInput = {
    id?: string
    requesterName: string
    requesterRole: $Enums.RequesterRole
    requesterId: string
    itemId: string
    quantity: number
    reason: string
    urgency: $Enums.Urgency
    status?: $Enums.RequestStatus
    requestDate?: Date | string
    responseDate?: Date | string | null
    responseNote?: string | null
  }

  export type InventoryRequestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    requesterName?: StringFieldUpdateOperationsInput | string
    requesterRole?: EnumRequesterRoleFieldUpdateOperationsInput | $Enums.RequesterRole
    requesterId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    reason?: StringFieldUpdateOperationsInput | string
    urgency?: EnumUrgencyFieldUpdateOperationsInput | $Enums.Urgency
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    requestDate?: DateTimeFieldUpdateOperationsInput | Date | string
    responseDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responseNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type InventoryRequestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    requesterName?: StringFieldUpdateOperationsInput | string
    requesterRole?: EnumRequesterRoleFieldUpdateOperationsInput | $Enums.RequesterRole
    requesterId?: StringFieldUpdateOperationsInput | string
    itemId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    reason?: StringFieldUpdateOperationsInput | string
    urgency?: EnumUrgencyFieldUpdateOperationsInput | $Enums.Urgency
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    requestDate?: DateTimeFieldUpdateOperationsInput | Date | string
    responseDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responseNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.Category | EnumCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCategoryFilter<$PrismaModel> | $Enums.Category
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type InventoryRequestListRelationFilter = {
    every?: InventoryRequestWhereInput
    some?: InventoryRequestWhereInput
    none?: InventoryRequestWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type InventoryRequestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InventoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    stockLevel?: SortOrder
    minStockLevel?: SortOrder
    unit?: SortOrder
    location?: SortOrder
    photo?: SortOrder
    storageInstructions?: SortOrder
    handlingProcedure?: SortOrder
    safetyNotes?: SortOrder
    lastUpdated?: SortOrder
  }

  export type InventoryAvgOrderByAggregateInput = {
    stockLevel?: SortOrder
    minStockLevel?: SortOrder
  }

  export type InventoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    stockLevel?: SortOrder
    minStockLevel?: SortOrder
    unit?: SortOrder
    location?: SortOrder
    photo?: SortOrder
    storageInstructions?: SortOrder
    handlingProcedure?: SortOrder
    safetyNotes?: SortOrder
    lastUpdated?: SortOrder
  }

  export type InventoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    category?: SortOrder
    stockLevel?: SortOrder
    minStockLevel?: SortOrder
    unit?: SortOrder
    location?: SortOrder
    photo?: SortOrder
    storageInstructions?: SortOrder
    handlingProcedure?: SortOrder
    safetyNotes?: SortOrder
    lastUpdated?: SortOrder
  }

  export type InventorySumOrderByAggregateInput = {
    stockLevel?: SortOrder
    minStockLevel?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Category | EnumCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCategoryWithAggregatesFilter<$PrismaModel> | $Enums.Category
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCategoryFilter<$PrismaModel>
    _max?: NestedEnumCategoryFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumRequesterRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.RequesterRole | EnumRequesterRoleFieldRefInput<$PrismaModel>
    in?: $Enums.RequesterRole[] | ListEnumRequesterRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequesterRole[] | ListEnumRequesterRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRequesterRoleFilter<$PrismaModel> | $Enums.RequesterRole
  }

  export type EnumUrgencyFilter<$PrismaModel = never> = {
    equals?: $Enums.Urgency | EnumUrgencyFieldRefInput<$PrismaModel>
    in?: $Enums.Urgency[] | ListEnumUrgencyFieldRefInput<$PrismaModel>
    notIn?: $Enums.Urgency[] | ListEnumUrgencyFieldRefInput<$PrismaModel>
    not?: NestedEnumUrgencyFilter<$PrismaModel> | $Enums.Urgency
  }

  export type EnumRequestStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RequestStatus | EnumRequestStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequestStatusFilter<$PrismaModel> | $Enums.RequestStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type InventoryRelationFilter = {
    is?: InventoryWhereInput
    isNot?: InventoryWhereInput
  }

  export type InventoryRequestCountOrderByAggregateInput = {
    id?: SortOrder
    requesterName?: SortOrder
    requesterRole?: SortOrder
    requesterId?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    reason?: SortOrder
    urgency?: SortOrder
    status?: SortOrder
    requestDate?: SortOrder
    responseDate?: SortOrder
    responseNote?: SortOrder
  }

  export type InventoryRequestAvgOrderByAggregateInput = {
    quantity?: SortOrder
  }

  export type InventoryRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    requesterName?: SortOrder
    requesterRole?: SortOrder
    requesterId?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    reason?: SortOrder
    urgency?: SortOrder
    status?: SortOrder
    requestDate?: SortOrder
    responseDate?: SortOrder
    responseNote?: SortOrder
  }

  export type InventoryRequestMinOrderByAggregateInput = {
    id?: SortOrder
    requesterName?: SortOrder
    requesterRole?: SortOrder
    requesterId?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    reason?: SortOrder
    urgency?: SortOrder
    status?: SortOrder
    requestDate?: SortOrder
    responseDate?: SortOrder
    responseNote?: SortOrder
  }

  export type InventoryRequestSumOrderByAggregateInput = {
    quantity?: SortOrder
  }

  export type EnumRequesterRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RequesterRole | EnumRequesterRoleFieldRefInput<$PrismaModel>
    in?: $Enums.RequesterRole[] | ListEnumRequesterRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequesterRole[] | ListEnumRequesterRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRequesterRoleWithAggregatesFilter<$PrismaModel> | $Enums.RequesterRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRequesterRoleFilter<$PrismaModel>
    _max?: NestedEnumRequesterRoleFilter<$PrismaModel>
  }

  export type EnumUrgencyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Urgency | EnumUrgencyFieldRefInput<$PrismaModel>
    in?: $Enums.Urgency[] | ListEnumUrgencyFieldRefInput<$PrismaModel>
    notIn?: $Enums.Urgency[] | ListEnumUrgencyFieldRefInput<$PrismaModel>
    not?: NestedEnumUrgencyWithAggregatesFilter<$PrismaModel> | $Enums.Urgency
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUrgencyFilter<$PrismaModel>
    _max?: NestedEnumUrgencyFilter<$PrismaModel>
  }

  export type EnumRequestStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RequestStatus | EnumRequestStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequestStatusWithAggregatesFilter<$PrismaModel> | $Enums.RequestStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRequestStatusFilter<$PrismaModel>
    _max?: NestedEnumRequestStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type InventoryRequestCreateNestedManyWithoutItemInput = {
    create?: XOR<InventoryRequestCreateWithoutItemInput, InventoryRequestUncheckedCreateWithoutItemInput> | InventoryRequestCreateWithoutItemInput[] | InventoryRequestUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryRequestCreateOrConnectWithoutItemInput | InventoryRequestCreateOrConnectWithoutItemInput[]
    createMany?: InventoryRequestCreateManyItemInputEnvelope
    connect?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
  }

  export type InventoryRequestUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<InventoryRequestCreateWithoutItemInput, InventoryRequestUncheckedCreateWithoutItemInput> | InventoryRequestCreateWithoutItemInput[] | InventoryRequestUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryRequestCreateOrConnectWithoutItemInput | InventoryRequestCreateOrConnectWithoutItemInput[]
    createMany?: InventoryRequestCreateManyItemInputEnvelope
    connect?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumCategoryFieldUpdateOperationsInput = {
    set?: $Enums.Category
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type InventoryRequestUpdateManyWithoutItemNestedInput = {
    create?: XOR<InventoryRequestCreateWithoutItemInput, InventoryRequestUncheckedCreateWithoutItemInput> | InventoryRequestCreateWithoutItemInput[] | InventoryRequestUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryRequestCreateOrConnectWithoutItemInput | InventoryRequestCreateOrConnectWithoutItemInput[]
    upsert?: InventoryRequestUpsertWithWhereUniqueWithoutItemInput | InventoryRequestUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: InventoryRequestCreateManyItemInputEnvelope
    set?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
    disconnect?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
    delete?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
    connect?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
    update?: InventoryRequestUpdateWithWhereUniqueWithoutItemInput | InventoryRequestUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: InventoryRequestUpdateManyWithWhereWithoutItemInput | InventoryRequestUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: InventoryRequestScalarWhereInput | InventoryRequestScalarWhereInput[]
  }

  export type InventoryRequestUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<InventoryRequestCreateWithoutItemInput, InventoryRequestUncheckedCreateWithoutItemInput> | InventoryRequestCreateWithoutItemInput[] | InventoryRequestUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryRequestCreateOrConnectWithoutItemInput | InventoryRequestCreateOrConnectWithoutItemInput[]
    upsert?: InventoryRequestUpsertWithWhereUniqueWithoutItemInput | InventoryRequestUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: InventoryRequestCreateManyItemInputEnvelope
    set?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
    disconnect?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
    delete?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
    connect?: InventoryRequestWhereUniqueInput | InventoryRequestWhereUniqueInput[]
    update?: InventoryRequestUpdateWithWhereUniqueWithoutItemInput | InventoryRequestUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: InventoryRequestUpdateManyWithWhereWithoutItemInput | InventoryRequestUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: InventoryRequestScalarWhereInput | InventoryRequestScalarWhereInput[]
  }

  export type InventoryCreateNestedOneWithoutRequestsInput = {
    create?: XOR<InventoryCreateWithoutRequestsInput, InventoryUncheckedCreateWithoutRequestsInput>
    connectOrCreate?: InventoryCreateOrConnectWithoutRequestsInput
    connect?: InventoryWhereUniqueInput
  }

  export type EnumRequesterRoleFieldUpdateOperationsInput = {
    set?: $Enums.RequesterRole
  }

  export type EnumUrgencyFieldUpdateOperationsInput = {
    set?: $Enums.Urgency
  }

  export type EnumRequestStatusFieldUpdateOperationsInput = {
    set?: $Enums.RequestStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type InventoryUpdateOneRequiredWithoutRequestsNestedInput = {
    create?: XOR<InventoryCreateWithoutRequestsInput, InventoryUncheckedCreateWithoutRequestsInput>
    connectOrCreate?: InventoryCreateOrConnectWithoutRequestsInput
    upsert?: InventoryUpsertWithoutRequestsInput
    connect?: InventoryWhereUniqueInput
    update?: XOR<XOR<InventoryUpdateToOneWithWhereWithoutRequestsInput, InventoryUpdateWithoutRequestsInput>, InventoryUncheckedUpdateWithoutRequestsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.Category | EnumCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCategoryFilter<$PrismaModel> | $Enums.Category
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Category | EnumCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCategoryWithAggregatesFilter<$PrismaModel> | $Enums.Category
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCategoryFilter<$PrismaModel>
    _max?: NestedEnumCategoryFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumRequesterRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.RequesterRole | EnumRequesterRoleFieldRefInput<$PrismaModel>
    in?: $Enums.RequesterRole[] | ListEnumRequesterRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequesterRole[] | ListEnumRequesterRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRequesterRoleFilter<$PrismaModel> | $Enums.RequesterRole
  }

  export type NestedEnumUrgencyFilter<$PrismaModel = never> = {
    equals?: $Enums.Urgency | EnumUrgencyFieldRefInput<$PrismaModel>
    in?: $Enums.Urgency[] | ListEnumUrgencyFieldRefInput<$PrismaModel>
    notIn?: $Enums.Urgency[] | ListEnumUrgencyFieldRefInput<$PrismaModel>
    not?: NestedEnumUrgencyFilter<$PrismaModel> | $Enums.Urgency
  }

  export type NestedEnumRequestStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RequestStatus | EnumRequestStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequestStatusFilter<$PrismaModel> | $Enums.RequestStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumRequesterRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RequesterRole | EnumRequesterRoleFieldRefInput<$PrismaModel>
    in?: $Enums.RequesterRole[] | ListEnumRequesterRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequesterRole[] | ListEnumRequesterRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRequesterRoleWithAggregatesFilter<$PrismaModel> | $Enums.RequesterRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRequesterRoleFilter<$PrismaModel>
    _max?: NestedEnumRequesterRoleFilter<$PrismaModel>
  }

  export type NestedEnumUrgencyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Urgency | EnumUrgencyFieldRefInput<$PrismaModel>
    in?: $Enums.Urgency[] | ListEnumUrgencyFieldRefInput<$PrismaModel>
    notIn?: $Enums.Urgency[] | ListEnumUrgencyFieldRefInput<$PrismaModel>
    not?: NestedEnumUrgencyWithAggregatesFilter<$PrismaModel> | $Enums.Urgency
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUrgencyFilter<$PrismaModel>
    _max?: NestedEnumUrgencyFilter<$PrismaModel>
  }

  export type NestedEnumRequestStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RequestStatus | EnumRequestStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequestStatusWithAggregatesFilter<$PrismaModel> | $Enums.RequestStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRequestStatusFilter<$PrismaModel>
    _max?: NestedEnumRequestStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type InventoryRequestCreateWithoutItemInput = {
    id?: string
    requesterName: string
    requesterRole: $Enums.RequesterRole
    requesterId: string
    quantity: number
    reason: string
    urgency: $Enums.Urgency
    status?: $Enums.RequestStatus
    requestDate?: Date | string
    responseDate?: Date | string | null
    responseNote?: string | null
  }

  export type InventoryRequestUncheckedCreateWithoutItemInput = {
    id?: string
    requesterName: string
    requesterRole: $Enums.RequesterRole
    requesterId: string
    quantity: number
    reason: string
    urgency: $Enums.Urgency
    status?: $Enums.RequestStatus
    requestDate?: Date | string
    responseDate?: Date | string | null
    responseNote?: string | null
  }

  export type InventoryRequestCreateOrConnectWithoutItemInput = {
    where: InventoryRequestWhereUniqueInput
    create: XOR<InventoryRequestCreateWithoutItemInput, InventoryRequestUncheckedCreateWithoutItemInput>
  }

  export type InventoryRequestCreateManyItemInputEnvelope = {
    data: InventoryRequestCreateManyItemInput | InventoryRequestCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type InventoryRequestUpsertWithWhereUniqueWithoutItemInput = {
    where: InventoryRequestWhereUniqueInput
    update: XOR<InventoryRequestUpdateWithoutItemInput, InventoryRequestUncheckedUpdateWithoutItemInput>
    create: XOR<InventoryRequestCreateWithoutItemInput, InventoryRequestUncheckedCreateWithoutItemInput>
  }

  export type InventoryRequestUpdateWithWhereUniqueWithoutItemInput = {
    where: InventoryRequestWhereUniqueInput
    data: XOR<InventoryRequestUpdateWithoutItemInput, InventoryRequestUncheckedUpdateWithoutItemInput>
  }

  export type InventoryRequestUpdateManyWithWhereWithoutItemInput = {
    where: InventoryRequestScalarWhereInput
    data: XOR<InventoryRequestUpdateManyMutationInput, InventoryRequestUncheckedUpdateManyWithoutItemInput>
  }

  export type InventoryRequestScalarWhereInput = {
    AND?: InventoryRequestScalarWhereInput | InventoryRequestScalarWhereInput[]
    OR?: InventoryRequestScalarWhereInput[]
    NOT?: InventoryRequestScalarWhereInput | InventoryRequestScalarWhereInput[]
    id?: StringFilter<"InventoryRequest"> | string
    requesterName?: StringFilter<"InventoryRequest"> | string
    requesterRole?: EnumRequesterRoleFilter<"InventoryRequest"> | $Enums.RequesterRole
    requesterId?: StringFilter<"InventoryRequest"> | string
    itemId?: StringFilter<"InventoryRequest"> | string
    quantity?: IntFilter<"InventoryRequest"> | number
    reason?: StringFilter<"InventoryRequest"> | string
    urgency?: EnumUrgencyFilter<"InventoryRequest"> | $Enums.Urgency
    status?: EnumRequestStatusFilter<"InventoryRequest"> | $Enums.RequestStatus
    requestDate?: DateTimeFilter<"InventoryRequest"> | Date | string
    responseDate?: DateTimeNullableFilter<"InventoryRequest"> | Date | string | null
    responseNote?: StringNullableFilter<"InventoryRequest"> | string | null
  }

  export type InventoryCreateWithoutRequestsInput = {
    id?: string
    name: string
    category: $Enums.Category
    stockLevel: number
    minStockLevel: number
    unit: string
    location: string
    photo?: string | null
    storageInstructions?: string | null
    handlingProcedure?: string | null
    safetyNotes?: string | null
    lastUpdated?: Date | string
  }

  export type InventoryUncheckedCreateWithoutRequestsInput = {
    id?: string
    name: string
    category: $Enums.Category
    stockLevel: number
    minStockLevel: number
    unit: string
    location: string
    photo?: string | null
    storageInstructions?: string | null
    handlingProcedure?: string | null
    safetyNotes?: string | null
    lastUpdated?: Date | string
  }

  export type InventoryCreateOrConnectWithoutRequestsInput = {
    where: InventoryWhereUniqueInput
    create: XOR<InventoryCreateWithoutRequestsInput, InventoryUncheckedCreateWithoutRequestsInput>
  }

  export type InventoryUpsertWithoutRequestsInput = {
    update: XOR<InventoryUpdateWithoutRequestsInput, InventoryUncheckedUpdateWithoutRequestsInput>
    create: XOR<InventoryCreateWithoutRequestsInput, InventoryUncheckedCreateWithoutRequestsInput>
    where?: InventoryWhereInput
  }

  export type InventoryUpdateToOneWithWhereWithoutRequestsInput = {
    where?: InventoryWhereInput
    data: XOR<InventoryUpdateWithoutRequestsInput, InventoryUncheckedUpdateWithoutRequestsInput>
  }

  export type InventoryUpdateWithoutRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    stockLevel?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    photo?: NullableStringFieldUpdateOperationsInput | string | null
    storageInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    handlingProcedure?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryUncheckedUpdateWithoutRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    stockLevel?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    photo?: NullableStringFieldUpdateOperationsInput | string | null
    storageInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    handlingProcedure?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryRequestCreateManyItemInput = {
    id?: string
    requesterName: string
    requesterRole: $Enums.RequesterRole
    requesterId: string
    quantity: number
    reason: string
    urgency: $Enums.Urgency
    status?: $Enums.RequestStatus
    requestDate?: Date | string
    responseDate?: Date | string | null
    responseNote?: string | null
  }

  export type InventoryRequestUpdateWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    requesterName?: StringFieldUpdateOperationsInput | string
    requesterRole?: EnumRequesterRoleFieldUpdateOperationsInput | $Enums.RequesterRole
    requesterId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    reason?: StringFieldUpdateOperationsInput | string
    urgency?: EnumUrgencyFieldUpdateOperationsInput | $Enums.Urgency
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    requestDate?: DateTimeFieldUpdateOperationsInput | Date | string
    responseDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responseNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type InventoryRequestUncheckedUpdateWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    requesterName?: StringFieldUpdateOperationsInput | string
    requesterRole?: EnumRequesterRoleFieldUpdateOperationsInput | $Enums.RequesterRole
    requesterId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    reason?: StringFieldUpdateOperationsInput | string
    urgency?: EnumUrgencyFieldUpdateOperationsInput | $Enums.Urgency
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    requestDate?: DateTimeFieldUpdateOperationsInput | Date | string
    responseDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responseNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type InventoryRequestUncheckedUpdateManyWithoutItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    requesterName?: StringFieldUpdateOperationsInput | string
    requesterRole?: EnumRequesterRoleFieldUpdateOperationsInput | $Enums.RequesterRole
    requesterId?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    reason?: StringFieldUpdateOperationsInput | string
    urgency?: EnumUrgencyFieldUpdateOperationsInput | $Enums.Urgency
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    requestDate?: DateTimeFieldUpdateOperationsInput | Date | string
    responseDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responseNote?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use InventoryCountOutputTypeDefaultArgs instead
     */
    export type InventoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InventoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InventoryDefaultArgs instead
     */
    export type InventoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InventoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InventoryRequestDefaultArgs instead
     */
    export type InventoryRequestArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InventoryRequestDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}