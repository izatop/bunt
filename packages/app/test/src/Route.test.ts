import HelloWorldRoute from "./app/Action/HelloWorldRoute";

test("Route", async () => {
    expect(HelloWorldRoute).toMatchSnapshot();
});
