import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const STELLAR_PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000000100";
const StelMemoModule = buildModule("StelMemoModule", (m) => {

  const stelMemo = m.contract("StelMemo", [STELLAR_PRECOMPILE_ADDRESS]);
  return { stelMemo };
});

export default StelMemoModule;
