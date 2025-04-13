/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

// Add declarations for CSS module imports with ?url suffix
declare module '*.css?url' {
  const url: string;
  export default url;
}

// If you also use CSS Modules without ?url:
// declare module '*.module.css' {
//   const classes: { [key: string]: string };
//   export default classes;
// }
