import {
  faHome,
  faFile,
  faTags,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

// types
import type { BottomNavigationItemType } from "./types";

export const bottomMap: BottomNavigationItemType[] = [
  {
    id: "home",
    label: "Home",
    to: "/",
    icon: faHome,
    position: "left",
  },
  {
    id: "notes",
    label: "Notes",
    to: "/notes",
    icon: faFile,
    position: "left",
  },
  {
    id: "categories",
    label: "Categories",
    to: "/categories",
    icon: faTags,
    position: "right",
  },
  {
    id: "profile",
    label: "Profile",
    to: "/profile",
    icon: faUser,
    position: "right",
  },
];
