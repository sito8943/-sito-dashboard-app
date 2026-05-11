import {
  faHome,
  faFile,
  faTags,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

// lib
import { APP_ROUTES } from "lib";

// types
import type { BottomNavigationItemType } from "./types";

export const bottomMap: BottomNavigationItemType[] = [
  {
    id: "home",
    label: "Home",
    to: APP_ROUTES.ROOT,
    icon: faHome,
    position: "left",
  },
  {
    id: "notes",
    label: "Notes",
    to: APP_ROUTES.NOTES,
    icon: faFile,
    position: "left",
  },
  {
    id: "categories",
    label: "Categories",
    to: APP_ROUTES.CATEGORIES,
    icon: faTags,
    position: "right",
  },
  {
    id: "profile",
    label: "Profile",
    to: APP_ROUTES.PROFILE,
    icon: faUser,
    position: "right",
  },
];
