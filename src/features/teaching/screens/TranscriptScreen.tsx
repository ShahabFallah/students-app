import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  useGetGrades,
  useGetStudent,
} from '../../../core/queries/studentHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { formatDate } from '../../../utils/dates';
import { formatFinalGrade, formatGrade } from '../../../utils/grades';
import { ProgressChart } from '../components/ProgressChart';

export const TranscriptScreen = () => {
  const { t } = useTranslation();
  const { palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const studentQuery = useGetStudent();
  const gradesQuery = useGetGrades();
  const { accessibilityListLabel } = useAccessibility();
  const {
    enrollmentCredits,
    enrollmentAttendedCredits,
    enrollmentAcquiredCredits,
    totalAttendedCredits,
    totalAcquiredCredits,
    totalCredits,
  } = studentQuery.data ?? {};

  const provisionalGrades = useMemo(
    () => gradesQuery.data?.filter(g => g.isProvisional),
    [gradesQuery],
  );
  const transcriptGrades = useMemo(
    () => gradesQuery.data?.filter(g => !g.isProvisional),
    [gradesQuery],
  );

  const isOffline = useOfflineDisabled();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl queries={[studentQuery, gradesQuery]} manual />
      }
    >
      <SafeAreaView>
        <Section>
          <SectionHeader title={t('transcriptScreen.yourCareer')} />
          <Card style={styles.chartCard} accessible={true}>
            <View style={GlobalStyles.grow}>
              <Metric
                title={t('transcriptScreen.acquiredCreditsLabel')}
                value={`${totalAcquiredCredits ?? '--'}/${
                  totalCredits ?? '--'
                } CFU`}
                style={styles.spaceBottom}
                accessibilityLabel={`${t(
                  'transcriptScreen.acquiredCreditsLabel',
                )}: ${totalAcquiredCredits} ${t('common.of')} ${totalCredits}`}
              />
              <Metric
                title={t('transcriptScreen.attendedCreditsLabel')}
                value={`${totalAttendedCredits ?? '--'}/${
                  totalCredits ?? '--'
                } CFU`}
                color={palettes.primary[400]}
                accessibilityLabel={`${t(
                  'transcriptScreen.attendedCreditsLabel',
                )}: ${totalAttendedCredits} ${t('common.of')} ${totalCredits}`}
              />
            </View>
            <ProgressChart
              data={
                totalCredits
                  ? [
                      (totalAttendedCredits ?? 0) / totalCredits,
                      (totalAcquiredCredits ?? 0) / totalCredits,
                    ]
                  : []
              }
              colors={[palettes.primary[400], palettes.secondary[500]]}
            />
          </Card>
        </Section>

        <Section>
          <SectionHeader title={t('transcriptScreen.thisYear')} />
          <Card style={styles.chartCard} accessible={true}>
            <View style={GlobalStyles.grow}>
              <Metric
                title={t('transcriptScreen.acquiredCreditsLabel')}
                value={`${enrollmentAcquiredCredits ?? '--'}/${
                  enrollmentCredits ?? '--'
                } CFU`}
                accessibilityLabel={`${t(
                  'transcriptScreen.acquiredCreditsLabel',
                )}: ${enrollmentAcquiredCredits} ${t(
                  'common.of',
                )} ${enrollmentCredits}`}
                style={styles.spaceBottom}
              />
              <Metric
                title={t('transcriptScreen.attendedCreditsLabel')}
                value={`${enrollmentAttendedCredits ?? '--'}/${
                  enrollmentCredits ?? '--'
                } CFU`}
                accessibilityLabel={`${t(
                  'transcriptScreen.attendedCreditsLabel',
                )}: ${enrollmentCredits} ${t(
                  'common.of',
                )} ${enrollmentCredits}`}
                color={palettes.primary[400]}
              />
            </View>
            <ProgressChart
              data={
                enrollmentCredits
                  ? [
                      (enrollmentAttendedCredits ?? 0) / enrollmentCredits,
                      (enrollmentAcquiredCredits ?? 0) / enrollmentCredits,
                    ]
                  : []
              }
              colors={[palettes.primary[400], palettes.secondary[500]]}
            />
          </Card>
        </Section>

        <Section>
          <SectionHeader title={t('transcriptScreen.averagesAndGrades')} />
          <Card style={styles.metricsCard} accessible={true}>
            <Grid>
              <Metric
                title={t('transcriptScreen.weightedAverageLabel')}
                value={studentQuery.data?.averageGrade ?? '--'}
                style={GlobalStyles.grow}
              />

              <Metric
                title={t('transcriptScreen.estimatedFinalGrade')}
                value={formatFinalGrade(studentQuery.data?.estimatedFinalGrade)}
                color={palettes.primary[400]}
                style={GlobalStyles.grow}
              />

              {studentQuery.data?.averageGradePurged && (
                <Metric
                  title={t('transcriptScreen.finalAverageLabel')}
                  value={studentQuery.data.averageGradePurged ?? '--'}
                  style={GlobalStyles.grow}
                />
              )}

              {studentQuery.data?.estimatedFinalGradePurged && (
                <Metric
                  title={t('transcriptScreen.estimatedFinalGradePurged')}
                  value={formatFinalGrade(
                    studentQuery.data.estimatedFinalGradePurged,
                  )}
                  color={palettes.primary[400]}
                  style={GlobalStyles.grow}
                />
              )}
            </Grid>

            {studentQuery.data?.mastersAdmissionAverageGrade && (
              <Metric
                title={t('transcriptScreen.masterAdmissionAverage')}
                value={studentQuery.data.mastersAdmissionAverageGrade ?? '--'}
                style={[GlobalStyles.grow, styles.additionalMetric]}
              />
            )}
          </Card>
        </Section>

        {provisionalGrades && provisionalGrades.length > 0 && (
          <Section>
            <SectionHeader
              title={t('transcriptScreen.provisionalGradesSectionTitle')}
            />
            <OverviewList>
              {provisionalGrades.map(grade => (
                <ListItem
                  key={grade.courseName}
                  title={grade.courseName}
                  subtitle={`${formatDate(grade.date)} - ${t(
                    'common.creditsWithUnit',
                    { credits: grade.credits },
                  )}`}
                  trailingItem={
                    <Text variant="title">{t(formatGrade(grade.grade))}</Text>
                  }
                />
              ))}
            </OverviewList>
          </Section>
        )}
        <Section>
          <SectionHeader
            title={t('common.transcript')}
            accessibilityLabel={`${t('common.transcript')} ${t(
              'transcriptScreen.total',
              { total: transcriptGrades?.length || 0 },
            )}`}
          />
          <OverviewList
            loading={!isOffline && gradesQuery.isLoading}
            emptyStateText={
              isOffline && gradesQuery.isLoading
                ? t('common.cacheMiss')
                : t('transcriptScreen.emptyState')
            }
          >
            {transcriptGrades?.map((grade, index) => (
              <ListItem
                key={grade.courseName}
                title={grade.courseName}
                accessibilityLabel={`${t(
                  accessibilityListLabel(index, transcriptGrades?.length || 0),
                )}. ${grade.courseName}: ${formatDate(grade.date)} ${t(
                  'common.grade',
                )}: ${grade?.grade} - ${t('common.creditsWithUnit', {
                  credits: grade.credits,
                })}`}
                subtitle={`${formatDate(grade.date)} - ${t(
                  'common.creditsWithUnit',
                  { credits: grade.credits },
                )}`}
                trailingItem={
                  <Text
                    variant="title"
                    style={styles.grade}
                    accessibilityLabel={`${t('common.grade')}: ${grade?.grade}`}
                  >
                    {t(formatGrade(grade.grade))}
                  </Text>
                }
              />
            ))}
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
    chartCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      marginTop: spacing[2],
      marginBottom: spacing[3],
    },
    metricsCard: {
      padding: spacing[4],
      marginTop: spacing[2],
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    additionalMetric: {
      marginTop: spacing[4],
    },
    grade: {
      marginLeft: spacing[2],
    },
  });
