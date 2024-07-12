import { createActorContext } from "@xstate/react"
import { onboardMachine } from "machines/onboard.machine"

export const OnboardMachineContext = createActorContext(onboardMachine)
