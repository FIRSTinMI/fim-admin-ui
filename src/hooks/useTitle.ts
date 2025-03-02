export function useTitle(title: string | undefined | null) {
  title = title ? `${title} - FIM Admin` : "FIM Admin";
  if (document.title !== title) document.title = title;
}