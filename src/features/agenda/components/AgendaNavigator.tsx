import { useTranslation } from 'react-i18next';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Logo } from '../../../core/components/Logo';
import { AgendaScreen } from '../screens/AgendaScreen';
import { LectureScreen } from '../screens/LectureScreen';

const Stack = createNativeStackNavigator();

export const AgendaNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          headerLargeTitle: false,
          headerLeft: () => <Logo />,
          headerTitle: t('Agenda'),
        }}
      />
      <Stack.Screen
        name="Lecture"
        component={LectureScreen}
        options={{
          headerTitle: t('Lecture'),
        }}
      />
    </Stack.Navigator>
  );
};
