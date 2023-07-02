const { TextDecoder, TextEncoder, Uint8Array } = require("util");

// For react-dom/server
// https://stackoverflow.com/a/72310804/3244654
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Uint8Array = Uint8Array;
