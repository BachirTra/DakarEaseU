import { toRsvpStatus } from "../useEvents";

describe("toRsvpStatus", () => {
  it("maps 'interested' intent to the 'interested' enum value", () => {
    expect(toRsvpStatus("interested")).toBe("interested");
  });

  it("maps 'going' intent to the 'confirmed' enum value", () => {
    expect(toRsvpStatus("going")).toBe("confirmed");
  });
});
