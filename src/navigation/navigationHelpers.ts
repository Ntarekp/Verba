import {
  CommonActions,
  DrawerActions,
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

    if (routeNames.includes('MainTabs')) {
      current.navigate('MainTabs', {
        screen: 'Dictionary',
        params: { screen: 'WordDetails', params: { word } },
      });
      return;
    }

    current = current.getParent();
  }
}

/** Navigate to immersive audio experience inside the Dictionary tab stack. */
export function navigateToAudioExperience(
  navigation: NavigationLike,
  word: string,
  phoneticIndex?: number
): void {
  let current: NavigationLike | undefined = navigation;

  while (current) {
    const routeNames = current.getState().routeNames ?? [];

    if (routeNames.includes('Dictionary')) {
      current.navigate('Dictionary', {
        screen: 'AudioExperience',
        params: { word, phoneticIndex },
      });
      return;
    }

    if (routeNames.includes('MainTabs')) {
      current.navigate('MainTabs', {
        screen: 'Dictionary',
        params: {
          screen: 'AudioExperience',
          params: { word, phoneticIndex },
        },
      });
      return;
    }

    if (routeNames.includes('AudioExperience')) {
      current.navigate('AudioExperience', { word, phoneticIndex });
      return;
    }

    current = current.getParent();
  }
}

/** Open the app drawer from any nested screen. */
export function openAppDrawer(navigation: NavigationLike): void {
  let current: NavigationLike | undefined = navigation;

  while (current) {
    if (current.getState().type === 'drawer') {
      current.dispatch(DrawerActions.openDrawer());
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

/** Reset the root navigator back to onboarding. */
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

/** Sign out and return to the auth login screen. */
export function resetToAuth(navigation: NavigationLike): void {
  let root: NavigationLike = navigation;
  while (root.getParent()) {
    root = root.getParent() as NavigationLike;
  }

  root.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    })
  );
}
