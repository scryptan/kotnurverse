import { Circle, forwardRef } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { Select } from "~/components/Select";
import { SingleSelectProps } from "~/components/Select/SingleSelect";
import { queryKeys } from "~/utils/query-keys";

export const SelectCategory = forwardRef<
  Omit<SingleSelectProps<string>, "options">,
  "input"
>((props, ref) => {
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.categories.find,
    staleTime: 1000 * 60 * 5,
  });

  const options = (categoriesQuery.data?.items || []).map((c) => ({
    label: c.title,
    value: c.id,
  }));

  const chosenCategory = props?.value
    ? categoriesQuery.data?.items.find((c) => c.id === props.value)
    : undefined;

  return (
    <Select.Single
      ref={ref}
      key={categoriesQuery.isLoading ? "loading" : options.length}
      isHideClear
      isLoading={categoriesQuery.isLoading}
      label="Категория"
      options={options}
      leftElementProps={{ pointerEvents: "none" }}
      leftElement={
        chosenCategory && <Circle size={5} bg={chosenCategory.color} />
      }
      {...props}
    />
  );
});
