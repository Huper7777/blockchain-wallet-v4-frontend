import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect, ConnectedProps } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { bindActionCreators } from 'redux'
import styled from 'styled-components'

import { Button, Icon, Link, Text, TextGroup } from 'blockchain-info-components'
import { crypto as wCrypto } from 'blockchain-wallet-v4/src'
import { SuccessCartridge } from 'components/Cartridge'
import QRCodeWrapper from 'components/QRCodeWrapper'
import { RemoteDataType } from 'core/types'
import { actions, selectors } from 'data'
import { LoginSteps } from 'data/types'

import { Props as OwnProps } from '..'
import { BackArrowFormHeader, CartridgeSentContainer, LOGIN_FORM_NAME } from '../model'

const Body = styled.div`
  display: flex;
  margin-bottom: 24px;
`
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 55%;
  margin-right: 24px;
  > div {
    margin-bottom: 16px;
  }
`
const LinkRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const MessageSentColumn = styled.div`
  display: flex;
  flex-direction: column;
`

const VerificationMobile = (props: Props) => {
  const { cacheActions, middlewareActions, qrData, setStep } = props

  const handleBackArrowClick = () => {
    props.cacheActions.removedStoredLogin()
    props.formActions.destroy(LOGIN_FORM_NAME)
    props.setStep(LoginSteps.ENTER_EMAIL_GUID)
    props.authActions.clearLoginError()
  }

  return (
    <>
      <BackArrowFormHeader {...props} handleBackArrowClick={handleBackArrowClick} />
      <Icon name='padlock' color='green600' size='20px' style={{ padding: '0 0 16px 4px' }} />
      <Body>
        {!props.phonePubKey && (
          <TextColumn>
            <Text color='grey900' size='16px' weight={600} lineHeight='1.5'>
              <FormattedMessage
                id='scenes.login.wallet.mobile_login.title'
                defaultMessage='Log in with mobile app'
              />
            </Text>
            <Text color='grey900' size='12px' weight={500} lineHeight='1.5'>
              <FormattedMessage
                id='scenes.login.wallet.mobile_login.description_1'
                defaultMessage='Scan this QR code with the Blockchain.com mobile app.'
              />
            </Text>
            <Text color='grey900' size='12px' weight={500} lineHeight='1.5'>
              <FormattedMessage
                id='scenes.login.wallet.mobile_login.description_2'
                defaultMessage='You can tap on the scanning icon on the top right corner of the app.'
              />
            </Text>
          </TextColumn>
        )}
        {props.secureChannelLoginState.cata({
          Failure: (e) => (
            <Text>
              {typeof e === 'string' ? (
                e
              ) : (
                <FormattedMessage
                  id='scenes.login.qrcodelogin_failed'
                  defaultMessage='Login failed. Please refresh browser and try again.'
                />
              )}
            </Text>
          ),
          Loading: () => {
            return (
              <Text size='14px' weight={600}>
                <FormattedMessage
                  id='scenes.login.qrcodelogin_success_confirm'
                  defaultMessage='Please confirm the login on your mobile device.'
                />
              </Text>
            )
          },
          NotAsked: () => <QRCodeWrapper value={qrData} size={175} showImage />,
          Success: () => {
            return (
              <Text size='14px' weight={600}>
                <FormattedMessage
                  id='scenes.login.qrcodelogin_success'
                  defaultMessage='Success! Logging in...'
                />
              </Text>
            )
          }
        })}
        {props.phonePubKey && (
          <MessageSentColumn>
            <CartridgeSentContainer>
              <SuccessCartridge>
                <FormattedMessage
                  id='scenes.login.wallet.message.sent'
                  defaultMessage='Message Sent'
                />
              </SuccessCartridge>
            </CartridgeSentContainer>

            <Text size='16px' color='grey900' weight={600} style={{ marginTop: '8px' }}>
              <FormattedMessage
                id='scenes.login.wallet.connected.title'
                defaultMessage='Mobile Device Connected'
              />
            </Text>

            <Text size='12px' color='grey900' weight={500} style={{ marginTop: '8px' }}>
              <FormattedMessage
                id='scenes.login.wallet.connected.description_1'
                defaultMessage='We sent your connected mobile device a notification. Open the app to confirm auto-log in on the web.'
              />
            </Text>
            <Text size='12px' color='grey900' weight={500} style={{ marginTop: '24px' }}>
              <FormattedMessage
                id='scenes.login.wallet.connected.description_2'
                defaultMessage='Didn’t get the notification? Make sure you have push notifications enabled. You can also scan this QR with your mobile app to login.'
              />
            </Text>

            <TextGroup inline style={{ lineHeight: '18px', marginTop: '8px' }}>
              <Link
                size='12px'
                weight={500}
                onClick={() => middlewareActions.resendMessageSocket()}
              >
                <FormattedMessage
                  id='scenes.login.wallet.connected.send_it_again'
                  defaultMessage='Send Again'
                />
              </Link>

              <Text size='12px' color='grey900' weight={500}>
                <FormattedMessage id='copy.or' defaultMessage='or' />
              </Text>

              <Link size='12px' weight={500} onClick={() => cacheActions.disconnectChannelPhone()}>
                <FormattedMessage
                  id='scenes.login.wallet.connected.add_a_new_device'
                  defaultMessage='Add a New Device'
                />
              </Link>
            </TextGroup>
          </MessageSentColumn>
        )}
      </Body>
      <LinkRow>
        <Button
          nature='empty-blue'
          fullwidth
          height='48px'
          data-e2e='loginWithPassword'
          style={{ marginBottom: '24px' }}
          onClick={() => setStep(LoginSteps.ENTER_PASSWORD)}
        >
          <FormattedMessage id='buttons.login_with_password' defaultMessage='Login with Password' />
        </Button>
        <LinkContainer to='/help'>
          <Link size='13px' weight={600} data-e2e='loginGetHelp'>
            <FormattedMessage id='scenes.login.needhelp' defaultMessage='Need some help?' />
          </Link>
        </LinkContainer>
      </LinkRow>
    </>
  )
}

const mapStateToProps = (state) => ({
  phonePubKey: selectors.cache.getPhonePubkey(state),
  qrData: selectors.cache.getChannelPrivKey(state)
    ? JSON.stringify({
        channelId: selectors.cache.getChannelChannelId(state),
        pubkey: wCrypto
          .derivePubFromPriv(Buffer.from(selectors.cache.getChannelPrivKey(state), 'hex'))
          .toString('hex'),
        type: 'login_wallet'
      })
    : '',
  secureChannelLoginState: selectors.auth.getSecureChannelLogin(state) as RemoteDataType<any, any>
})

const mapDispatchToProps = (dispatch) => ({
  middlewareActions: bindActionCreators(actions.ws, dispatch)
})

const connector = connect(mapStateToProps, mapDispatchToProps)

type Props = OwnProps & {
  setStep: (step: LoginSteps) => void
} & ConnectedProps<typeof connector>

export default connector(VerificationMobile)
