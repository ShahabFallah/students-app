import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { openCamera } from 'react-native-image-crop-picker';

import {
  faCamera,
  faPaperclip,
  faShare,
} from '@fortawesome/free-solid-svg-icons';
import { ActionSheet } from '@lib/ui/components/ActionSheet';
import { Col } from '@lib/ui/components/Col';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { IS_ANDROID, IS_IOS } from '../../../core/constants';
import { useKeyboard } from '../../../core/hooks/useKeyboard';
import { useReplyToTicket } from '../../../core/queries/ticketHooks';
import { pdfSizes } from '../../teaching/constants';
import { AttachmentBlobCard } from './AttachmentBlobCard';

interface Props {
  disable?: boolean;
  ticketId: number;
}

export const TicketTextField = ({ disable, ticketId }: Props) => {
  const { t } = useTranslation();
  const bottomBarHeight = useBottomTabBarHeight();
  const actionSheetRef = useRef<any>(null);
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const [text, setText] = useState<string>('');
  const [attachment, setAttachment] = useState<Blob>(null);
  const keyboardVisible = useKeyboard();

  const {
    mutateAsync: handleReply,
    isLoading,
    isSuccess,
  } = useReplyToTicket(ticketId);

  useEffect(() => {
    if (isSuccess) {
      setText('');
      setAttachment(null);
      Keyboard.dismiss();
    }
  }, [isSuccess]);

  const extraStyle = useMemo(() => {
    return {
      bottom: keyboardVisible ? (IS_ANDROID ? 0 : bottomBarHeight) : 0,
    };
  }, [keyboardVisible]);

  const onPressUploadFile = async () => {
    const asset = await DocumentPicker.pickSingle({});
    const blob = await fetch(asset.uri).then(r => r.blob());
    setAttachment(blob);
  };

  const onPressTakePhoto = async () => {
    try {
      const res = await openCamera({
        ...pdfSizes,
        mediaType: 'photo',
        multiple: false,
        cropping: true,
        freeStyleCropEnabled: true,
        includeBase64: true,
      });
      const blob = await fetch(res.path).then(r => r.blob());
      setAttachment(blob);
    } catch (e) {
      console.debug({ errorTakePhoto: e });
    }
  };

  const onPressSend = async () => {
    // console.debug({
    //   ticketId: ticketId,
    //   attachment: attachment,
    //   message: text.replace(/\n/g, '<br>'),
    // });
    await handleReply({
      ticketId: ticketId,
      attachment: attachment,
      message: text.replace(/\n/g, '<br>'),
    });
  };

  return (
    <KeyboardAvoidingView behavior={IS_IOS ? 'padding' : 'height'}>
      <View>
        <ActionSheet
          ref={actionSheetRef}
          options={[
            {
              title: t('common.uploadFile'),
              titleAndroid: t('common.upload'),
              subtitle: t('common.uploadFileSubtitle'),
              icon: faPaperclip,
              iconStyle: {},
              onPress: onPressUploadFile,
            },
            {
              title: t('common.takePhoto'),
              titleAndroid: t('common.camera'),
              subtitle: t('common.takePhotoSubtitle'),
              icon: faCamera,
              iconStyle: {},
              onPress: onPressTakePhoto,
            },
          ]}
        />
        <Col
          justifyCenter
          alignCenter
          style={[styles.wrapper, extraStyle]}
          noFlex
        >
          {!!attachment && (
            <Row
              noFlex
              justifyCenter
              alignCenter
              style={styles.attachmentContainer}
            >
              <FlatList
                data={[attachment]}
                contentContainerStyle={{
                  justifyContent: 'center',
                  alignSelf: 'center',
                  width: '100%',
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  return (
                    <AttachmentBlobCard
                      attachment={item}
                      onPressCancelAttachment={() => setAttachment(null)}
                    />
                  );
                }}
              />
            </Row>
          )}
          <Row alignCenter justifyCenter noFlex>
            <Col noFlex>
              <IconButton
                onPress={() => actionSheetRef.current.show()}
                icon={faPaperclip}
                size={24}
                color={colors.text['500']}
              />
            </Col>
            <Col>
              <TextField
                label={t('ticketScreen.reply')}
                value={text}
                onChangeText={setText}
                multiline
                editable={!disable}
                style={[styles.textField, disable && styles.textFieldDisabled]}
                inputStyle={styles.textFieldInput}
              />
            </Col>
            {!!text && (
              <Col noFlex>
                <IconButton
                  onPress={onPressSend}
                  icon={faShare}
                  size={24}
                  loading={isLoading}
                  color={colors.text['500']}
                />
              </Col>
            )}
          </Row>
        </Col>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = ({
  spacing,
  colors,
  fontSizes,
  fontWeights,
  shapes,
}: Theme) =>
  StyleSheet.create({
    wrapper: {
      paddingVertical: spacing['2'],
      paddingHorizontal: spacing['4'],
      backgroundColor: colors.background,
    },
    attachmentContainer: {
      marginBottom: spacing[4],
    },
    textField: {
      borderRadius: shapes.lg,
      borderWidth: 1,
      backgroundColor: colors.surface,
      paddingVertical: 0,
      borderColor: colors.divider,
      width: '100%',
    },
    textFieldDisabled: {
      opacity: 0.5,
    },
    textFieldInput: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      borderBottomWidth: 0,
    },
  });