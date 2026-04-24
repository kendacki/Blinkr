import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Blinkremit } from "../target/types/blinkremit";

describe("blinkremit", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Blinkremit as Program<Blinkremit>;

  it("loads program idl", () => {
    if (!program) {
      throw new Error("Program workspace not loaded; run anchor build && anchor test from Anchor toolchain");
    }
    expect(program.programId).toBeDefined();
  });
});
