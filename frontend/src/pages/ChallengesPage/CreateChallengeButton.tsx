import { Button, ButtonProps, useDisclosure } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api";
import ChallengeWindow from "~/components/ChallengeWindow";
import { useHandleError } from "~/hooks/useHandleError";
import { CreateChallenge } from "~/types/challenge";
import { queryKeys } from "~/utils/query-keys";

type Props = {
  defaultCategoryId?: string;
} & ButtonProps;

export const CreateChallengeButton = ({ defaultCategoryId, ...props }: Props) => {
  const window = useDisclosure();
  const queryClient = useQueryClient();
  const handleError = useHandleError();

  const createChallenge = useMutation({
    mutationFn: async (data: CreateChallenge) => {
      return await api.challenges.create(data);
    },
    onSuccess: async () => {
      window.onClose();
      await queryClient.refetchQueries({ queryKey: queryKeys.challenges() });
    },
    onError: handleError,
  });

  return (
    <>
      <Button
        {...props}
        {...window.getButtonProps()}
        w="fit-content"
        variant="link"
        colorScheme="blue"
        fontWeight="normal"
        children="Создать требование"
      />
      <ChallengeWindow.Create
        {...window.getDisclosureProps()}
        defaultCategoryId={defaultCategoryId}
        isOpen={window.isOpen}
        onClose={window.onClose}
        isLoading={createChallenge.isPending}
        onSubmit={createChallenge.mutateAsync}
      />
    </>
  );
};
