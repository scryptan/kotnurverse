import { HStack, Heading } from "@chakra-ui/react";
import { SingleEliminationBracket } from "@g-loot/react-tournament-brackets";
import { CommonTreeProps } from "@g-loot/react-tournament-brackets/dist/src/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compare } from "fast-json-patch";
import { memo, useEffect, useState } from "react";
import api from "~/api";
import {
  TourneySpecification,
  TourneyState,
  TourneyTeam,
} from "~/types/tourney";
import queryKeys from "~/utils/query-keys";
import { castToTourneyRound } from "~/utils/round";
import { addSpecificationToRound, createMatchesFromTeams } from "~/utils/tourney";
import { useTourneyContext } from "../tourney-context";
import Match from "./Match";
import SvgViewer from "./SvgViewer";
import TeamsManualSortingButton from "./TeamsManualSortingButton";
import TeamsShuffleButton from "./TeamsShuffleButton";

type Props = {
  id: string;
  state: TourneyState;
  teams: TourneyTeam[];
  specifications: TourneySpecification[];
};

const TourneyBracket = ({ id, state, teams, specifications }: Props) => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isEditable } = useTourneyContext();
  const isPrepare = state === TourneyState.Prepare;

  const roundsQuery = useQuery({
    queryKey: queryKeys.rounds(id),
    queryFn: () => api.rounds.findByTourneyId(id),
    enabled: !isPrepare,
  });

  const [previewRounds, setPreviewRounds] = useState(() => {
    const rounds = calcRounds(teams, isEditable ? specifications : undefined);
    if (!roundsQuery.isLoading) return rounds;
    return rounds.map((r) => ({ ...r, isLoading: true }));
  });

  useEffect(() => {
    if (!isPrepare) return;
    setPreviewRounds(
      calcRounds(teams, isEditable ? specifications : undefined)
    );
  }, [teams, specifications, isEditable]);

  const editTeams = useMutation({
    mutationFn: async (teams: TourneyTeam[]) => {
      const operations = compare({}, { teams });
      return await api.tourneys.patch(id, operations);
    },
    onSuccess: async (tourney) => {
      queryClient.setQueryData(queryKeys.tourney(tourney.id), tourney);
    },
  });

  const rounds =
    isPrepare || roundsQuery.isLoading
      ? previewRounds
      : (roundsQuery.data?.items || []).map(
          castToTourneyRound(teams, isAuthenticated)
        );

  if (teams.length < 4 || rounds.length < 2 || roundsQuery.isError) {
    const message = roundsQuery.isError
      ? "Не удалось загрузить турнирную сетку"
      : isEditable
      ? "Создайте минимум 4 команды для построения турнирной сетки"
      : "Турнирная сетка не построена";

    return <Heading my="100px" mx="auto" fontSize="lg" children={message} />;
  }

  const bracket = (
    <SingleEliminationBracket
      options={options}
      matches={rounds}
      matchComponent={Match}
      svgWrapper={({ children, ...props }) => (
        <SvgViewer {...props} containerProps={{ px: 4 }} children={children} />
      )}
    />
  );

  if (isEditable) {
    return (
      <>
        {bracket}
        <ActionsButton
          teams={teams}
          onTeamsChange={async (newTeams: TourneyTeam[]) => {
            await editTeams.mutateAsync(newTeams);
          }}
        />
      </>
    );
  }

  return bracket;
};

const options: CommonTreeProps["options"] = {
  style: {
    width: 268,
    boxHeight: 124,
    spaceBetweenRows: 20,
    horizontalOffset: 0,
    roundSeparatorWidth: 50,
    connectorColor: "#ADADAD",
    roundHeader: { isShown: false },
    lineInfo: {
      homeVisitorSpread: 0,
    },
  },
};

type ActionsButtonProps = {
  teams: TourneyTeam[];
  onTeamsChange: (teams: TourneyTeam[]) => Promise<void>;
};

const ActionsButton = ({ teams, onTeamsChange }: ActionsButtonProps) => (
  <HStack>
    <TeamsShuffleButton teams={teams} onTeamsChange={onTeamsChange} />
    <TeamsManualSortingButton teams={teams} onSubmit={onTeamsChange} />
  </HStack>
);

const calcRounds = (
  teams: TourneyTeam[],
  specifications?: TourneySpecification[]
) => {
  const rounds = createMatchesFromTeams(teams);
  return specifications !== undefined
    ? rounds.map(addSpecificationToRound(specifications))
    : rounds;
};

const calcTeamsKey = (teams: TourneyTeam[]) =>
  teams.map((t) => `${t.id}:${t.title}`).join("|");

const calcSpecificationsKey = (specifications: TourneySpecification[]) =>
  specifications.map((s) => s.title).join("|");

export default memo(TourneyBracket, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.state === next.state &&
    calcTeamsKey(prev.teams) === calcTeamsKey(next.teams) &&
    calcSpecificationsKey(prev.specifications) ===
      calcSpecificationsKey(next.specifications)
  );
});
