import {
  CommonActions,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';

/** Minimal navigation shape shared by stack and tab navigators. */
export type NavigationLike = {
  dispatch: NavigationProp<ParamListBase>['dispatch'];
  getState: () => { routeNames?: string[]; type?: string };
  getParent: () => NavigationLike | undefined;
  navigate: (...args: any[]) => void;
};

/** Navigate to Word Details inside the Dictionary tab stack. */
export function navigateToWordDetails(
  navigation: NavigationLike,
  word: string
): void {
  let current: NavigationLike | undefined = navigation;

  while (current) {
    const routeNames = current.getState().routeNames ?? [];

    if (routeNames.includes('Dictionary')) {
      current.navigate('Dictionary', {
        screen: 'WordDetails',
        params: { word },
      });
      return;
    }

    current = current.getParent();
  }
}

/** Switch to the Saved tab from any nested screen. */
export function navigateToSavedTab(navigation: NavigationLike): void {
  let current: NavigationLike | undefined = navigation;

  while (current) {
    const routeNames = current.getState().routeNames ?? [];

    if (routeNames.includes('Saved')) {
      current.navigate('Saved');
      return;
    }

    current = current.getParent();
  }
}

/** Reset the root navigator back to onboarding (Settings logout). */
export function resetToOnboarding(navigation: NavigationLike): void {
  let root: NavigationLike = navigation;
  while (root.getParent()) {
    root = root.getParent() as NavigationLike;
  }

  root.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    })
  );
}
