import { Definition, parse, ParseContext } from './parse';
import { Parse, VarParams } from './types';

type Variables<T> = {
  [K in VarParams<T>]: string | number | boolean | object | undefined;
};

export type Context = {
  type: string;
};

export function query<T extends Definition<K, V>, K extends any, V extends any>(tpl: T, options?: {
  name?: string;
}): {
  (variables: Variables<T>): {
    query: string;
    variables: typeof variables;
  };
  type: Parse<T>;
  toString(): string;
} {
  const ctx: ParseContext = {
    args: [],
    fragments: [],
    fragmentObjs: [],
    fragmentIndex: {},
    argAlias: {},
  }

  // @ts-ignore
  const type = (this as Context).type;

  let _query: string | undefined;
  const getQuery = () => _query || (_query = parse(type, options && options.name, tpl, ctx));

  const fn = (variables: object) => {
    const query = getQuery();
    const newVars = {};

    Object.keys(variables).forEach((key) => {
      newVars[ctx.argAlias[key]] = variables[key];
    });

    return {
      query: query,
      variables: newVars,
    };
  };

  fn.type = undefined as any;
  fn.toString = getQuery;

  // @ts-ignore
  return fn;
};
