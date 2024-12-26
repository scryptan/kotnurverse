import { Button, Heading, Stack } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api";
import { useHandleError } from "~/hooks/useHandleError";
import { RoundState } from "~/types/round";
import { queryKeys } from "~/utils/query-keys";
import { useRoundContext } from "../round-context";
import { Stage } from "./Stage";

const STAGE_COLOR = "#38B2AC";
const STAGE_STATE = RoundState.Pause;

export const PauseStage = () => {
  const handleError = useHandleError();
  const queryClient = useQueryClient();
  const { isOrganizer, round, getTeams, getCurrentTeam, getTimerEnd } =
    useRoundContext();

  const currentTeam = getCurrentTeam();
  const timerEnd = getTimerEnd();

  const endTimeoutMutation = useMutation({
    mutationFn: async () => {
      return await api.rounds.end(round.id, STAGE_STATE, currentTeam?.id);
    },
    onSuccess: (round) => {
      queryClient.setQueryData(queryKeys.round(round.id), round);
    },
    onError: handleError,
  });

  return (
    <>
      {getTeams().map((team, i) => (
        <Stage.Team key={team?.id || i} gridArea={`t${i + 1}`} team={team} />
      ))}
      {timerEnd && (
        <Stage.Timer
          gridArea="m"
          alignSelf="center"
          justifySelf="center"
          endDate={timerEnd}
          activeColor={STAGE_COLOR}
        />
      )}
      <Stack align="center" gridArea="b" spacing={4}>
        <Heading textAlign="center" fontSize={{ base: "xl", md: "2xl" }}>
          Таймаут команды "{currentTeam?.title || "???"}"
        </Heading>
        {isOrganizer && (
          <Button
            colorScheme="teal"
            isLoading={endTimeoutMutation.isPending}
            onClick={() => endTimeoutMutation.mutateAsync()}
            children="Закончить таймаут"
          />
        )}
      </Stack>
    </>
  );
};
