import { Stack } from "@chakra-ui/react";
import { Loading } from "~/components/Loading";
import useAutoRedirect from "~/hooks/useAutoRedirect";
import { paths } from "~/pages/paths";
import { useAuthContext } from "~/utils/auth-context";
import SettingsSection from "./SettingsSection";
import { TourneysSection } from "./TourneysSection";

export const ProfilePage = () => {
  const { isAuthenticated } = useAuthContext();

  useAutoRedirect({ isEnabled: !isAuthenticated, path: paths.main.path });

  if (!isAuthenticated) {
    return <Loading flex={1} />;
  }

  return (
    <Stack mx="auto" px={8} w="full" maxW="wrapper" flex={1} spacing={20}>
      <SettingsSection />
      <TourneysSection />
    </Stack>
  );
};
