export function Listed({
  childrens,
  index,
}: {
  childrens: JSX.Element[];
  index: number;
}) {
  return childrens[index];
}
