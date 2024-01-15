# @ibnlanre/portal

Inspired by [React Holmes](https://github.com/devx-os/react-holmes) and [Tanstack Query](https://tanstack.com/query/latest), `@ibnlanre/portal` is a simple **application** state management library for managing component state on a global level.

## Table of Contents

- [Installation](#installation)
  - [Using package managers](#using-package-managers)
    - [`yarn`](#yarn)
    - [`npm`](#npm)
    - [`pnpm`](#pnpm)
  - [Using a CDN](#using-a-cdn)
    - [`unpkg`](#unpkg)
    - [`jsDelivr`](#jsdelivr)
- [Usage](#usage)
  - [Importing a module](#importing-a-module)
- [Portal](#portal)
  - [Difference between `state` and `get` properties](#difference-between-state-and-get-properties)
  - [Basic usage](#basic-usage)
    - [Using the `state` property](#using-the-state-property)
    - [Using the `get` property](#using-the-get-property)
    - [Using the `set` property](#using-the-set-property)
    - [Using the `state`, `get`, and `set` properties](#using-the-state-get-and-set-properties)
    - [Using the `select` property](#using-the-select-property)
  - [Persisting state](#persisting-state)
    - [Using the `local` hook](#using-the-local-hook)
    - [Modifying the `local` hook](#modifying-the-local-hook)
    - [Using the `session` hook](#using-the-session-hook)
    - [Modifying the `session` hook](#modifying-the-session-hook)
    - [Using the `cookie` hook](#using-the-cookie-hook)
    - [Modifying the `cookie` hook](#modifying-the-cookie-hook)
  - [Portal register](#portal-register)
    - [Register keys and values](#register-keys-and-values)
    - [Creating a typed portal using a register](#creating-a-typed-portal-using-a-register)
    - [Using a typed portal](#using-a-typed-portal)
    - [Using the configuration object](#using-the-configuration-object)
    - [Persisting a typed portal](#persisting-a-typed-portal)
  - [Updating the state of a portal](#updating-the-state-of-a-portal)
    - [Using the `setState` function](#using-the-setstate-function)
    - [Callbacks as arguments to `setState`](#callbacks-as-arguments-to-setstate)
  - [Portal utilities](#portal-utilities)
    - [`.entries`](#entries)
    - [`.hasItem`](#hasitem)
    - [`.getItem`](#getitem)
    - [`.setItem`](#setitem)
    - [`.removeItem`](#removeitem)
    - [`.clear`](#clear)

- [Atom](#atom)
- [Author](#author)
- [Contributions](#contributions)
- [Release](#release)
- [License](#license)

## Installation

To install `@ibnlanre/portal`, you can use either a CDN, or a package manager. Run the following command within your project directory. The library is written in TypeScript and ships with its own type definitions, so you don't need to install any type definitions.

### Using package managers

If you are working on a project that uses a package manager, you can copy one of the following commands to install `@ibnlanre/portal` using your preferred package manager:

#### `yarn`

```shell
yarn add @ibnlanre/portal
```

#### `npm`

```shell
npm i @ibnlanre/portal
```

#### `pnpm`

```bash
pnpm i @ibnlanre/portal
```

### Using a CDN

If you are working on a project that uses markup languages like HTML, you can copy one of the following script tags to install `@ibnlanre/portal` using your preferred CDN:

#### `unpkg`

```html
<script src="https://unpkg.com/@ibnlanre/portal"></script>
```

#### `jsDelivr`

```html
<script src="https://cdn.jsdelivr.net/npm/@ibnlanre/portal"></script>
```

## Usage

The following is an overview of the modules available in the `@ibnlanre/portal` library:

| Module             | Description                                                      |
|--------------------|------------------------------------------------------------------|
| `portal`           | Create a portal for accessing and updating states                |
| `createBuilder`    | Create a builder object for defining keys and values             |
| `atom`             | A utility for creating isolated states outside a component       |
| `cookieStorage`    | An object representing the Cookie Storage API                    |
| `debounceEffect`   | A utility for creating a debounced effect in React               |

### Importing a module

The following code snippet demonstrates how to import a module from `@ibnlanre/portal`:

```typescript
import { portal } from "@ibnlanre/portal";
```

## Portal

`Portal` is a utility that facilitates sharing and accessing state across components. It eliminates the need for prop drilling, and the `context` API. Furthermore, it does not require a provider, or a consumer. It is a simple function that returns a tuple containing the state and a function to update the state. `Portal` accepts a key and an optional configuration object. The configuration object can have the following properties:

- `state`: The initial state of the portal. It can be a primitive value, an object, or an array. Technically, it can be any value.
- `get`: A function that accepts the current state as an argument and returns a value. The value is used to override the initial state.
- `set`: A side effect that accepts the current state as its argument. It is invoked when the state changes.
- `select`: A function that transforms the current state into a different value. It is invoked when the state changes.

### Difference between `state` and `get` properties

The difference between the `state` and `get` properties is that the `state` property is expected to be a pure value that doesn't involve any side effects. it is passed to a `useState` hook as the initial state of the `portal`. The `get` property, on the other hand, can be used to retrieve the initial state from a persistent storage, or network request. It is called within a `useEffect` hook, and is therefore invoked after the `state` is set, and overrides the `state` if present.

### Basic usage

While `portal` itself is an object containing a couple of utility functions, creating states requires the `use` hook. The `use` hook accepts a key and an optional configuration object as its arguments. The configuration object defines the initial state of the portal, and how the state is treated.


 It returns a tuple containing the state and a function to update the state. The following code snippet demonstrates how to use the `portal` function:

```typescript
A configuration object can be passed to the `portal` function to define the initial state and how the state is updated. It is however not required. If a configuration object is not passed to the `portal` function, the initial state is set to `undefined`. The following code snippet demonstrates how to use the `portal` function without a configuration object:

```typescript
const [name, setName] = portal.use("client")
```

### Configuration object

The configuration object can have the following properties:

#### Using the `state` property

The `state` property is used to define the initial state of the portal. It has the same signature as the argument passed to a `useState` hook. It can be a function that returns a value, an object, an array, or a primitive value. The function should not have any side effects. The following code snippet demonstrates how to use the `state` property:

```typescript
const [name, setName] = portal.use("client", {
  state: "John Doe"
});

const [name, setName] = portal.use("client", {
  state: () => "Jane Doe"
});
```

#### Using the `get` property

The `get` property can be used to retrieve the initial state from a persistent storage. The `get` function accepts the current state as an argument and sets the returned value as the next state of the portal. The following code snippet demonstrates how to use the `get` property:

```typescript
const [name, setName] = portal.use("client", {
  get: (state) => {
    const value = localStorage.getItem("client");
    if (value) return JSON.parse(value) as string
    return state;
  }
});
```

#### Using the `set` property

The `set` property is a side effect that can be used to update the browser store when the state changes. It is also called when the portal is instantiated. The `set` function accepts the current state as an argument. The following code snippet demonstrates how to use the `set` property:

```typescript
const [name, setName] = portal.use("client", {
  set: (state) => {
    const value = JSON.stringify(state);
    localStorage.setItem("client", value);
  }
});
```

#### Using the `state`, `get`, and `set` properties

The `state`, `get`, and `set` properties can be used together to define the initial state, how the initial state is retrieved, and how the state is persisted. If the `state` property is not defined, a good practice is to define the `get` function before the `set` function, because of type inference. The following code snippet demonstrates how to use the `state`, `get`, and `set` properties:

```typescript
import { get, set } from 'idb-keyval';

const [name, setName] = portal.use("client", {
  state: "John Doe",
  get: async (state) => {
    const value = await get('client');
    if (value) return JSON.parse(value);
    return state;
  },
  set: async (state) => {
    const value = JSON.stringify(state);
    await set('client', value);
  }
});
```

#### Using the `select` property

The `select` property is used to transform the current state into a different value. The `select` function accepts the current state as an argument and returns a value. The following code snippet demonstrates how to use the `select` property:

```typescript
const [name, setName] = portal.use("client", {
  select: (state) => state.toUpperCase()
});
```

### Persisting state

Rather than using the configuration object to manually persist state, `portal` provides utility hooks to do so. Internally, each of these hooks use the `set` and `get` properties to modify the state, before it is used. The `get` function is called on the retrieved value before it is set as the next state. While, the `set` function is called on the current state before it is passed to the browser storage. The following code snippet demonstrates how the mechanism is implemented **internally**:

```typescript
const {
  set = (value: State) => JSON.stringify(value),
  get = (value: string) => JSON.parse(value),
} = { ...config };
```

#### Using the `local` hook

The `local` hook is used to persist the state in `localStorage`. The following code snippet demonstrates how to use the `local` hook:

```typescript
const [name, setName] = portal.local("client");
```

#### Modifying the `local` hook

The `local` hook uses the `localStorage` API to persist the state. The `localStorage` API accepts a `key` and a `value` as arguments. The `value` is converted to a string using the `JSON.stringify` function before it is persisted. The following code snippet demonstrates how to override the `set` and `get` properties of the `local` hook:

```typescript
const [name, setName] = portal.local("client", {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value),
});
```

#### Using the `session` hook

The `session` hook is used to persist the state in `sessionStorage`. The following code snippet demonstrates how to use the `session` hook:

```typescript
const [name, setName] = portal.session("client");
```

#### Modifying the `session` hook

The `session` hook uses the `sessionStorage` API to persist the state. The `sessionStorage` API accepts a `key` and a `value` as arguments. The `value` is converted to a string using the `JSON.stringify` function before it is persisted. The following code snippet demonstrates how to override the `set` and `get` properties of the `session` hook:

```typescript
const [name, setName] = portal.session("client", {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value),
});
```

#### Using the `cookie` hook

The `cookie` hook is used to persist the state in `document.cookie`. The following code snippet demonstrates how to use the `cookie` hook:

```typescript
const [name, setName] = portal.cookie("client", {
  path: "/"
});
```

#### Modifying the `cookie` hook

The `cookie` hook uses the `cookieStorage` API exposed by this library, to persist the state. The `cookieStorage` API accepts a `key`, `value` and an optional configuration object as arguments. The `value` is converted to a string using the `JSON.stringify` function before it is persisted. The following code snippet demonstrates how to override the `set` and `get` properties of the `cookie` hook:

```typescript
const [name, setName] = portal.cookie("client", {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value),
});
```

### Portal register

A register is a record of `key` and `value` pairs. The `key` is a string and the `value` can be any value. The register serves as a store for possible portal keys and values. The following code snippet shows what a register looks like:

```typescript
const register = {
  foo: {
    bar: {
      baz: "qux"
    },
    rim: "raf"
  },
};
```

#### Register keys and values

The nested keys of a register are the possible keys of a portal. And the values of each corresponding key in the register are the possible values of the portal. The pairs generated from the register above include the following properties:

```txt
- foo = { bar: { baz: "qux" }, rim: "raf" }
- foo.bar = { baz: "qux" }
- foo.bar.baz = "qux"
- foo.rim = "raf"
```

#### Creating a typed portal using a register

The `portal` object ships with a `make` function that can be used to create a typed portal outside of React Components, so that it can be exported and used elsewhere. The `make` function accepts a register as an argument and returns a typed portal. The following code snippet demonstrates how to create a typed portal using a register:

```typescript
export const store = portal.make(register);
```

#### Using a typed portal

The register `keys` are used as the keys of the typed portal, and register `values` are used as the initial state of the typed portal. The following code snippet demonstrates how to use a typed portal:

```typescript
const [foo, setFoo] = store.use("foo");
```

#### Using the configuration object

The register `keys` are used as the keys of the typed portal, and register `values` are used as the initial state of the typed portal. A `state` property can be passed to the configuration object to override the initial state of the typed portal, but it must be of the same type as the register `value`. The following code snippet demonstrates how to use a typed portal with a configuration object:

```typescript
const [foo, setFoo] = store.use("foo", {
  state: {
    bar: {
      baz: "nim"
    },
    rim: "fur"
  }
});
```

#### Persisting a typed portal

A typed portal can also be persisted using the `local`, `session`, or `cookie` hooks. It would interest you to know that `portal` itself is a typed portal of `any` type. The following code snippet demonstrates how to persist a typed portal:

```typescript
const [foo, setFoo] = store.local("foo");
```

### Updating the state of a portal

The state of a portal can be updated using the `setState` function returned by the `use` hook. It can also be updated using the `setItem` utility function. The following code snippet demonstrates how to update the state of a portal:

```typescript
const [name, setName] = portal.use("client");
setName("Jane Doe");
```

#### Using the `setState` function

It is advised that you do not use the `setState` function within the top level of a React Component. This is because the `setState` function would trigger a rerender of the component, which would in turn trigger cause infinite rerenders. The `setState` function accepts a value as its argument. The following code snippet demonstrates how to properly use the `setState` function:

```typescript
const [name, setName] = portal.use("client");

useEffect(() => {
  setName("Jane Doe");
}, []);
```

#### Callbacks as arguments to `setState`

The `setState` function also accepts a callback as its argument. The callback accepts the current state as its argument and returns a value. The returned value is used to update the state of the portal. The following code snippet demonstrates how to use a callback as an argument to `setState`:

```typescript
const [name, setName] = portal.use("client");

useEffect(() => {
  setName((prev) => prev.toUpperCase());
}, []);
```

### Portal utilities

The `portal` object ships with a couple of utility functions that can be used to manipulate the state of a portal. The following code snippet demonstrates how to use the `portal` utilities:

#### `.entries`

The `entries` getter is used to retrieve the entries of a portal. It returns a record of `key` and `value` pairs. The following code snippet demonstrates how to use the `entries` getter:

```typescript
const entries = portal.entries;
```

#### `.hasItem`

The `hasItem` utility function is used to check if a portal has a state. It accepts a `key` as its argument and returns a boolean. The following code snippet demonstrates how to use the `hasItem` utility function:

```typescript
const hasName = portal.hasItem("client");
```

#### `.getItem`

The `getItem` utility function is used to retrieve the state of a portal. It accepts a `key` as its argument and returns the state of the portal. The following code snippet demonstrates how to use the `getItem` utility function:

```typescript
const name = portal.getItem("client");
```

#### `.setItem`

The `setItem` utility function is used to update the state of a portal, outside of React Components. It accepts a `key` and a `value` as its arguments. The following code snippet demonstrates how to use the `setItem` utility function:

```typescript
portal.setItem("client", "Jane Doe");
```

#### `.removeItem`

The `removeItem` utility function is used to remove the state of a portal. It accepts a `key` as its argument. The following code snippet demonstrates how to use the `removeItem` utility function:

```typescript
portal.removeItem("client");
```

#### `.clear`

The `clear` utility function is used to remove all the states of a portal. The following code snippet demonstrates how to use the `clear` utility function:

```typescript
portal.clear();
```

## `atom`

atom is a standalone state container that can be accessed and modified from anywhere in your application. It uses the same underlying mechanism as the `portal` function for reactivity, but is designed to replicate the behavior of the useEffect hook outside of React Components. It accepts a configuration object as its argument. The configuration object can have the following properties:

- `state`: The initial state of the atom. It can be a primitive value, an object, or an array. In order words, it can be any value.
- `events`: An object containing functions that can be used to update the state of the atom. The functions are called events because they are triggered when the state of the atom changes.
- `context`: An object containing states that do not influence the state of the atom. The states are called context because they are made available during instantiation and usage.
- `debug`: A boolean value that determines if the atom should log its state to the console.
- `debounce`: A set of options that determines the how the `use` event is triggered.

### atom `state`

`atoms` are typically created outside of React Components, and used within the context of a React component. It takes a configuration object as its argument, defining the `state`, `context` and `events` of the atom.

#### Using a `state` value

The `state` property is required, as it is used to determine the initial state and type of the atom. The following code snippet demonstrates how to create an `atom`:

```typescript
const counterAtom = atom({
  state: 10,
});
```

#### Using a `state` callback

The `state` property can either be a value or a callback that returns a value. The callback takes the `context` as an argument, and the returned value is used as the initial state of the atom. The `context` property, if not defined, is an empty object. The following code snippet demonstrates how to use a `state` callback:

```typescript
const counterAtom = atom({
  state: () => 10,
});
```

### atom `events`

The `events` property is an object containing functions that can be used to manipulate the state of the atom. There are three key events: `set`, `get`, and `use`. The following code snippet demonstrates how to use the `events` property:

- The state of the atom is retrieved from `localStorage`. This does not cause hydration problems because the state is calculated at the point of creating the atom. The returned value is set as the initial state of the atom.
- The `set` event is triggered when the state of the atom is updated. It is used to persist the state of the atom in `localStorage`. The returned value is set as the new state of the atom.
- The `get` event is triggered when the state of the atom is accessed, within a React Component. It is used to convert the state of the atom to a string. This conversion does not affect the state of the atom.
- The `use` event is triggered when the atom is used within a React Component. It is called only once, when the component mounts. It is used to increment the state of the atom every second. It returns a function that is used to clear the interval, which would be called when the component unmounts.

```typescript
const counterAtom = atom({
  state: () => {
    const value = localStorage.getItem("counter");
    if (value) return JSON.parse(value);
    return 0;
  },
  events: {
    set: ({ value }) => {
      localStorage.setItem("counter", JSON.stringify(value));
      return value;
    },
    get: ({ value }) => value.toString(),
    use: ({ set }) => {
      const interval = setInterval(() => {
        set((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    },
  },
});
```

#### `.set`

The `set` event is triggered when the state of the atom is about to be updated. This event can be used to modify the state of the atom before it is set or persist the state of the atom at the point of update. It expects a callback, which accepts a `params` object as its argument and returns a value. The returned value becomes the new state of the atom. The `params` object includes the following properties:

- `value`: The state about to be set.
- `previous`: The current state of the atom.
- `ctx`: The context of the atom.
- `emit`: A function used to update the context of the atom.

#### Using the `set` event

The callback passed to the `set` event changes the value just before it is set as the new state of the atom. The following code snippet demonstrates how to use the `set` event:

```tsx
const capitalizeAtom = atom({
  state: "",
  events: {
    set: ({ value }) => {
      return value.split(" ").map((word) => {
        return word.slice(0, 1).toUpperCase() + word.slice(1);
      }).join(" ");
    },
  },
});
```

An alternative would be to use the `get` event to achieve the same effect without setting it as the state of the atom, or using the `select` property of the `use` hook. The following code snippet demonstrates its usage:

```typescript
const [name, setName] = capitalizeAtom.use();

return (
  <input value={name} onChange={(event) => {
    setName(event.target.value);
  }} />
);
```

#### `.get`

The `get` event is triggered when the state of the atom is accessed, within a React Component. This event can be used to modify the state of the atom before it is retrieved. The `get` function accepts a `params` object as its first argument and an arbitrary number of arguments as its second. The `params` object includes the following properties:

- `value`: The state about to be retrieved.
- `previous`: The current state of the atom.
- `ctx`: The context of the atom.
- `emit`: A function used to update the context of the atom.

#### Using the `get` event

The arbitrary number of arguments are expected to be passed on the `use` hook, via its `getArgs` property. These arguments can be seen as dependencies of the `get` event. The following code snippet demonstrates how to use the `get` event, with dependencies:

```typescript
const counterAtom = atom({
  state: 10,
  events: {
    get: ({ value }, increment: number, decrement: number) => {
      return value + increment - decrement
    },
  },
});

const [counter, setCounter] = counterAtom.use({
  getArgs: [10, 2] // 18
});
```

#### `.use`

The `use` event is a wrapper around the `useEffect` hook. It is suitable for executing side effects, such as network requests, and WebSocket connections. The `use` event accepts the properties returned by the `atom` function as its first argument, and an arbitrary number of arguments as its second. The object of parameters includes the following properties:

##### State properties

- `value`: The current state of the atom.
- `subscribe`: A function used to subscribe to the state of the atom.
- `publish`: A function used to update the state of the atom without triggering the `set` event.
- `timeline`: An object that provides methods to navigate previous states of the atom.
- `set`: A function used to update the state of the atom.

##### Context propeties

- `ctx`: The context of the atom.
- `provide`: A function used to subscribe to the context of the atom.
- `emit`: A function used to update the context of the atom.

##### Garbage collection

- `on`: An object containing functions for managing garbage collection.
- `dispose`: A function used to trigger garbage collection.

#### Using the `use` event

The `use` event is triggered as a result of an atom being used in a React Component. It is invoked when the component mounts, and when the arbitrary number of arguments passed on the `use` hook changes. This matters only if the `use` event has an arbitrary number of arguments. The following code snippet demonstrates how to use the `use` event:

```typescript
const contactsAtom = atom({
  state: ["John Doe", "Jane Doe"],
  events: {
    set: ({ value }) => decrypt(value),
    get: ({ value }) => {
      return value.sort((a, b) => a.localeCompare(b));
    },
    use: ({ set }, search: string = "") => {
      const abortController = new AbortController();

      const url = new URL("http://example.com/contact");
      if (search) url.searchParams.set("filter", search);
      else url.searchParams.delete("filter");

      fetch(url.toString(), {
        signal: abortController.signal,
      })
        .then(response => response.json())
        .then((value) => {
          set(value.data);
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });

      return () => {
        abortController.abort();
      }
    },
  },
});
```

#### Using the `useArgs` property

The arbitrary number of arguments are expected to be passed on the `use` hook, via its `useArgs` property. These arguments can be seen as dependencies of the `use` event. If the `enabled` property of the `use` hook is set to `false`, the `use` event will not triggered. It is however `true` by default. The following code snippet demonstrates how to use the `use` hook, with the `useArgs` property:

```tsx
const [search, setSearch] = useState("");
const [data, setData] = contactsAtom.use({ useArgs: [search] });

return (
  <input onChange={(event) => setSearch(event.target.value)} />
);
```

#### Disposing the garbage

Garbage collection is a mechanism for reclaiming memory that is no longer being used by an application. It is important to dispose the garbage, in order to prevent memory leaks. The `use` event provides two ways of disposing the garbage: using the `dispose` function, or using the `dispose` object. Additionally, the `on` object can be used to manage garbage collection.

##### Using the `dispose` function

The `use` event returns a function that can be used for cleanup, in order words, dispose the garbage. The function is called only when the component `unmounts`. The following code snippet shows what that function looks like:

```typescript
return () => {
  abortController.abort();
}
```

##### Using the `dispose` object

An object containing functions for managing garbage collection, during `rerun` and `unmount` could also be returned, instead. This may be convenient when cleanups are required both during `rerun` and `unmount`. The following code shows what the object looks like:

```typescript
return {
  rerun: () => {
    abortController.abort();
  },
  unmount: () => {
    abortController.abort();
  },
}
```

##### Using the `on` object

A final alternative would be to use the `on` object, which is made available within the `use` event. Consequently, it can be used within callbacks, and the `use` event itself. The following code snippet demonstrates how to use the `on` object:

```typescript
on.rerun(() => {
  abortController.abort();
});

on.unmount(() => {
  abortController.abort();
});
```

### atom `context`

The `context` property is an object containing **reactive** states that do not influence the state of the atom. The `context` property is made available during instantiation and usage.

#### Using the `context` property

The `publish` function is used in the following example to update the state of the atom, because the `set` event is not defined. Still, using the `set` function would have achieved the same result. The following code snippet demonstrates how to use the `context` property:

```typescript
const contactsAtom = atom({
  state: ["John Doe", "Jane Doe"],
  context: {
    url: new URL("http://example.com/contact"),
    isLoading: false,
    isError: false,
  },
  events: {
    use: ({ emit, publish, ctx: { url } }, search: string) => {
      const abortController = new AbortController();
      emit({ isLoading: true });

      if (search) url.searchParams.set("filter", search);
      else url.searchParams.delete("filter");

      fetch(url.toString(), {
        signal: abortController.signal,
      })
        .then(response => response.json())
        .then((value) => {
          publish(value.data);
          emit({ isLoading: false });
        })
        .catch((error) => {
          emit({ isError: true, isLoading: false });
          console.error('Error:', error.message);
        });

      const cleanup = () => {
        abortController.abort();
        emit({ isError: false, isLoading: false });
      }

      return {
        rerun: cleanup,
        unmount: cleanup,
      }
    },
  },
});
```

#### Leveraging `context` for storing references

The need for the `context` property becomes more apparent when working with **websockets**, or for storing object references. Creating an `atom` returns an object with the same properties as the first argument passed to the `use` event callback, including two additional properties: the `get` and `use` callbacks passed during instantiation. This makes it suitable as a type for external functions, as the
 `weatherAtom`


. The following code snippet demonstrates how to use the `context` property with **websockets**:

```typescript
type Weather = {
  time: string,
  temperature: number,
  period: "morning" | "afternoon" | "evening",
};

function getWeather(atom: typeof weatherAtom, filter: Partial<Weather>) {
  const { emit, publish, on } = atom;
  const ws = new WebSocket("ws://example.com/users");

  ws.onopen = (() => {
    ws.send(JSON.stringify(filter));
    emit({ ws });
  });

  ws.onmessage = ((value) => {
    publish(JSON.parse(value.data));
    emit({ isLoading: false });
  });

  ws.onerror = ((error) => {
    emit({ isLoading: false, ws: null });
    console.error('Error:', error);

    if (ws.readyState === WebSocket.OPEN) ws.close();
    getWeather(atom, filter);
  });
}

const weatherAtom = atom({
  state: [] as Array<Weather>,
  context: {
    ws: null as WebSocket | null,
    isLoading: false,
  },
  events: {
    use: ({ emit, ctx: { ws } }, filter: Partial<Weather>) => {
      emit({ isLoading: true });

      if (ws) ws.send(JSON.stringify(filter));
      else getWeather(weatherAtom, filter);
    },
  },
});
```

### `atom` utilities

The `atom` object ships with a couple of utility functions that can be used to manipulate the state of an atom. The following code snippet demonstrates how to use the `atom` utilities:

#### `.emit`

The `emit` function is used to update the context of the atom. It can accept partial values, which are merged with the current context of the atom, or a callback that accepts the current context as its argument and returns a value. The returned value is used to update the context of the atom. The following code snippet demonstrates how to use the `emit` function:

```typescript
```

### `.subscribe`

Although it is possible to use atoms as dependencies of other atoms, it is not recommended. This is because referencing an atom in another atom, does not make the referencing atom reactive. It is possible to subscribe to the state of the referencing atom,

```typescript
const [messages, setMessages] = messagesAtom.use();
const [users, setUsers] = userAtom.use({ useArgs: [messages.user] });
```

## `createBuilder`

The `createBuilder` function is used to create a builder object for defining keys and values. It accepts a register as its first argument, and an optional list of prefixes as its second argument. The following code snippet demonstrates how to use the `createBuilder` function:

```typescript
const register = {
  foo: {
    baz: (id: number) => `/bazaar/${id}`,
    bar: 10,
  },
};

const builder = createBuilder(register);
```

### Constructing keys

The main motivation behind the `builder` object is to provide a way of defining keys and values, without having to worry about constructing a meaningful key, or accessing its corresponding value. Generating the key requires either the `use` or `get` function. These functions are found at every level of the `builder` object. The `key` returned from calling the `use` or `get` function is an array of strings, crafted from the branches in the register.

#### `.use` function

The `use` function is used to retrieve the keys, expecting the same signature as the defined value. If the value of that branch is a primitive value, object or array, the `use` function expects no arguments. However, if the value is a function that expects arguments, the `use` function expects the same arguments. `foo.baz` is a function that expects an `id` of `number` type, therefore, the `use` function expects an `id` of `number` type as well. If the argument was optional, it would equally be optional. The following code snippet demonstrates how to use the `use` function:

```typescript
builder.foo.baz.use(11); // ["foo", "baz", 11]
```

#### `.get` function

The `get` function is used to retrieve the keys, without following the pattern defined by the value. It expects an arbitrary number of arguments, which are added to the returned array of strings. This flexibility is useful when you want to add more keys that are not defined in the register. The following code snippet demonstrates how to use the `get` function:

 The following code snippet demonstrates how to use the `get` function:

```typescript
builder.foo.baz.get(); // ["foo", "baz"]
builder.foo.baz.get("test"); // ["foo", "baz", "test"]
```

#### Transforming the key using .join

Because the `key` returned from calling the `use` or `get` function is an array of strings, it is possible to transform the key using the `join` method. The `join` method is a function that concatenates the strings in the array, using a separator. The following code snippet demonstrates how to use the `join` functions:

```typescript
builder.foo.baz.get().join("."); // "foo.baz"
builder.foo.baz.use(11).join("/"); // "/foo/baz/11"
```

### Retrieving values

The root is the starting point of the `builder` object. It is effectively the register, which is passed to the `createBuilder` function. Calling the `.use` function on the root branch returns the register itself, while calling the `.get` function constructs a key for the root. This is a different behavior from the other branches, which instead, generates a key from the nested keys of the register. The following code snippet demonstrates what the root branch looks like:

```typescript
builder.use(); // register
builder.get(); // []
```

As a consequence of the `use` function returning the register, it is possible to retrieve the nested values of the register. The following code snippet demonstrates how to retrieve the nested values of the register:

```typescript
builder.use().foo.baz(12); // "/bazaar/12"
builder.use().foo.bar; // 10
```

### Using prefixes

The `createBuilder` function accepts an optional list of prefixes as its second argument. The prefixes are used to construct the keys of the `builder` object. The following code snippet demonstrates how to use prefixes:

```typescript






To get the type of object passed to the builder

```typescript
const builder = createBuilder(store);

// Note that the actual value of builder.is is undefined.
type StoreType = typeof builder.is;

// Ease of use accessing the type of nested properties.
type BarType = typeof builder.is.foo.bar;
```

## Author

Ridwan Olanrewaju, [root.i.ng](https://www.root.i.ng), [@ibnlanre](https://linkedin.com/in/ibnlanre)

## Contributions

All contributions are welcome and appreciated. Thanks for taking the time to contribute to `@ibnlanre/portal` 💚

## Release

```shell
git add . # stages the changes made.
yarn package # builds and deploy.
```

## License

This library is licensed under the [MIT License](https://opensource.org/licenses/MIT).

```txt
Feel free to customize the content according to your needs. But, do leave a shoutout. Thanks! 😊.
```

```typescript

const userAtom = atom({
  state: { name: "John Doe" },
  events: {
    use: ({ set }) => {
      const interval = setInterval(() => {
        set((prev) => ({ ...prev, name: "Jane Doe" }));
      }, 1000);

      return {
        unmount: () => clearInterval(interval),
      };
    },
  },
  context: {
    isLoading: false,
  },
});

const [value, { isLoading: isLoadingContext }] = userAtom.use();
const { user, setUser, isLoading } = userAtom.use({
  key: "user",
});
```


## Signals

Signals are objects with a 




A signal is an object that has a value and can be observed for changes. It is similar to a state, but it is not bound to a component. It can be used to share data between components. It updates the components when the signal changes and updates the UI without re-rendering the whole component.


```typescript
import { signal } from "@ibnlanre/portal";

// this could equally be defined inside the component
const count = signal(0);
const sideEffect = (value) => {
  console.log("count", value);
};

// if defined within the Counter component
// peek.value would be updated when count changes
// because count.current causes a re-render
const peek = signal(count.value + 2);

function Counter() {
  // .current makes the value reactive, .value does not
  // but re-renders can make .value seem reactive
 const double = signal(count.current * 3);

  // subscriptions can happen within the component
  // because the callback is defined outside it
  const dispose = count.subscribe(sideEffect);

 return (
    <div>
      <p>No change: value + 2 = {peek.value}</p>
    <button onClick={() => count.value++}>
     Value: {count.value}, value x 3 = {double.value}
    </button>
    </div>
 );
}

```
