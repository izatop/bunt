import {Cookie, Cookies, Headers} from "../../src";

describe("Cookies", () => {
    test("Serialize", () => {
        const cookie = new Cookie("name", "value", {
            domain: "example.com",
            expires: new Date(1),
            maxAge: 123,
            httpOnly: true,
            path: "/path",
            sameSite: "Lax",
            secure: false,
        });

        expect(cookie.serialize()).toMatchSnapshot();
    });

    test("Parse", () => {
        const headers = new Headers([]);
        headers.set("cookie", "foo=bar; session=abc; n=123");
        expect(new Cookies(headers).toJSON()).toEqual({
            foo: "bar",
            session: "abc",
            n: "123",
        });
    });
});
