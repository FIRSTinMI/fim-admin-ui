import StreamKeys from "./StreamKeys";
import VmixConfig from "./VmixConfig";

export default {
  stream_key: {
    label: "Stream Key Management",
    component: StreamKeys,
  },
  vmix_config: {
    label: "VMix Config",
    component: VmixConfig,
  },
} as { [key: string]: { label: string; component: any } };
