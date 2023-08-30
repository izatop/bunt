import {Duplex, Readable, Stream, Transform, Writable} from "stream";
import {isObject} from "@bunt/is";

type IsStream = Readable | Writable | Duplex | Transform | Stream;

const isStream = (stream: unknown): stream is IsStream => (
    stream !== null &&
    isObject(stream) &&
    typeof stream.pipe === "function"
);

const isWritableStream = (stream: unknown): stream is Writable => (
    isStream(stream) &&
    "writable" in stream &&
    typeof stream._write === "function"
);

const isReadableStream = (stream: unknown): stream is Readable => (
    isStream(stream) &&
    "readable" in stream &&
    typeof stream._read === "function"
);

const isDuplexStream = (stream: unknown): stream is Duplex => (
    isWritableStream(stream) &&
    isReadableStream(stream)
);

const isTransformStream = (stream: unknown): stream is Transform => (
    isStream(stream) &&
    "readable" in stream &&
    "writable" in stream &&
    "_transform" in stream &&
    typeof stream._transform === "function"
);

export {
    isStream,
    isReadableStream,
    isWritableStream,
    isDuplexStream,
    isTransformStream,
};
