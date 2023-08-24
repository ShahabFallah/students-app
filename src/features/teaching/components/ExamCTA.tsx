import { useTranslation } from 'react-i18next';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { ExamStatusEnum } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import {
  useBookExam,
  useCancelExamBooking,
} from '../../../core/queries/examHooks';
import { Exam } from '../../../core/types/api';
import { TeachingStackParamList } from './TeachingNavigator';

interface Props {
  exam: Exam;
}

export const ExamCTA = ({ exam }: Props) => {
  const { t } = useTranslation();

  const { navigate } =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();

  const { mutateAsync: bookExam, isLoading: isBooking } = useBookExam(exam.id);
  const { mutateAsync: cancelBooking, isLoading: isCancelingBooking } =
    useCancelExamBooking(exam.id);

  const examRequestable = exam?.status === ExamStatusEnum.Requestable;
  const examAvailable = exam?.status === ExamStatusEnum.Available;

  const confirm = useConfirmationDialog();

  const disabledStatuses = [
    ExamStatusEnum.RequestAccepted,
    ExamStatusEnum.RequestRejected,
    ExamStatusEnum.Unavailable,
  ] as ExamStatusEnum[];
  const action = async () => {
    if (examRequestable) {
      return navigate('ExamRequest', { id: exam.id });
    } else if (examAvailable) {
      if (exam.question) {
        return navigate('ExamQuestion', { id: exam.id });
      } else {
        return bookExam({});
      }
    }
    if (await confirm()) {
      return cancelBooking();
    }
    return Promise.reject();
  };

  if (disabledStatuses.includes(exam.status)) return null;

  const mutationsLoading = isBooking || isCancelingBooking;

  return (
    <CtaButton
      destructive={!examAvailable && !examRequestable}
      title={
        examRequestable
          ? t('examScreen.ctaRequest')
          : examAvailable
          ? t('examScreen.ctaBook')
          : t('examScreen.ctaCancel')
      }
      action={action}
      loading={mutationsLoading}
      successMessage={
        examAvailable
          ? t('examScreen.ctaBookSuccess')
          : t('examScreen.ctaCancelSuccess')
      }
    />
  );
};