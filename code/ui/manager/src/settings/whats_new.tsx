import type { ComponentProps, FC } from 'react';
import React, { Fragment, useEffect, useState } from 'react';
import { styled, useTheme } from '@storybook/theming';
import { IconButton, Icons, Loader } from '@storybook/components';
import { useStorybookApi } from '@storybook/manager-api';
import { global } from '@storybook/global';

const Centered = styled.div({
  top: '50%',
  position: 'absolute',
  transform: 'translateY(-50%)',
  width: '100%',
  textAlign: 'center',
});

const LoaderWrapper = styled.div({
  position: 'relative',
  height: '32px',
});

const Message = styled.div(({ theme }) => ({
  paddingTop: '12px',
  color: theme.textMutedColor,
  maxWidth: '295px',
  margin: '0 auto',
  fontSize: `${theme.typography.size.s1}px`,
  lineHeight: `16px`,
}));

const Container = styled.div(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  bottom: '40px',
  background: theme.background.bar,
  fontSize: `13px`,
  borderTop: '1px solid',
  borderColor: theme.appBorderColor,
  padding: '8px 12px',
  display: 'flex',
  justifyContent: 'space-between',
}));

const ToggleNotificationButton = styled(IconButton)(({ theme }) => ({
  fontWeight: theme.typography.weight.regular,
  color: theme.color.mediumdark,
  margin: 0,
}));

const CopyButton = styled(IconButton)(() => ({
  margin: 0,
  padding: 0,
  borderRadius: 0,
}));

export const WhatsNewFooter = ({
  isNotificationsDisabled,
  onToggleNotifications,
  onCopyLink,
}: {
  isNotificationsDisabled: boolean;
  onToggleNotifications?: () => void;
  onCopyLink?: () => void;
}) => {
  const theme = useTheme();
  const [copyText, setCopyText] = useState('Copy Link');
  const copyLink = () => {
    onCopyLink();
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy Link'), 4000);
  };

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icons icon="heart" color={theme.color.mediumdark} />
        <div>Share this with your team.</div>
        <CopyButton onClick={copyLink} small>
          {copyText}
        </CopyButton>
      </div>
      <ToggleNotificationButton onClick={onToggleNotifications}>
        {isNotificationsDisabled ? (
          <>
            <Icons icon="eye" />
            &nbsp;Show notifications
          </>
        ) : (
          <>
            <Icons icon="eyeclose" />
            &nbsp;Hide notifications
          </>
        )}
      </ToggleNotificationButton>
    </Container>
  );
};

const Iframe = styled.iframe<{ isLoaded: boolean }>(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: 0,
    margin: 0,
    padding: 0,
    width: '100%',
    height: 'calc(100% - 80px)',
  },
  ({ isLoaded }) => ({ visibility: isLoaded ? 'visible' : 'hidden' })
);

const AlertIcon = styled(((props) => <Icons icon="alert" {...props} />) as FC<
  Omit<ComponentProps<typeof Icons>, 'icon'>
>)(({ theme }) => ({
  color: theme.textMutedColor,
  width: 32,
  height: 32,
  margin: '0 auto',
}));

const WhatsNewLoader: FC = () => (
  <Centered>
    <LoaderWrapper>
      <Loader />
    </LoaderWrapper>
    <Message>Loading...</Message>
  </Centered>
);

const MaxWaitTimeMessaging: FC = () => (
  <Centered>
    <AlertIcon />
    <Message>The page couldn't be loaded. Check your internet connection and try again.</Message>
  </Centered>
);

export interface WhatsNewProps {
  didHitMaxWaitTime: boolean;
  isLoaded: boolean;
  onLoad: () => void;
  url?: string;
  onCopyLink?: () => void;
  onToggleNotifications?: () => void;
}

const PureWhatsNewScreen: FC<WhatsNewProps> = ({
  didHitMaxWaitTime,
  isLoaded,
  onLoad,
  url,
  onCopyLink,
  onToggleNotifications,
}) => (
  <Fragment>
    {!isLoaded && !didHitMaxWaitTime && <WhatsNewLoader />}
    {didHitMaxWaitTime ? (
      <MaxWaitTimeMessaging />
    ) : (
      <>
        <Iframe isLoaded={isLoaded} onLoad={onLoad} src={url} title={`What's new?`} />
        <WhatsNewFooter
          isNotificationsDisabled
          onToggleNotifications={onToggleNotifications}
          onCopyLink={onCopyLink}
        />
      </>
    )}
  </Fragment>
);

const MAX_WAIT_TIME = 10000; // 10 seconds

const WhatsNewScreen: FC<Omit<WhatsNewProps, 'isLoaded' | 'onLoad' | 'didHitMaxWaitTime'>> = ({
  url,
}) => {
  const api = useStorybookApi();
  const [isLoaded, setLoaded] = useState(false);
  const [didHitMaxWaitTime, setDidHitMaxWaitTime] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => !isLoaded && setDidHitMaxWaitTime(true), MAX_WAIT_TIME);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <PureWhatsNewScreen
      didHitMaxWaitTime={didHitMaxWaitTime}
      isLoaded={isLoaded}
      onLoad={() => {
        api.whatsNewHasBeenRead();
        setLoaded(true);
      }}
      url={url}
      onCopyLink={() => {
        navigator.clipboard.writeText(url);
      }}
      onToggleNotifications={() => {
        if (global.confirm('All update notifications will no longer be shown. Are you sure?')) {
          api.toggleWhatsNewNotifications();
        }
      }}
    />
  );
};

export { WhatsNewScreen, PureWhatsNewScreen };
