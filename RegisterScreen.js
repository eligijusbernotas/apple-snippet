import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import styles from '../styles/styles';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { ROOT } from '../plugins/globals';
import firebase from '@react-native-firebase/app';
//components
import SvgLogo from '../assets/svg/SvgLogo';
import LoginRegInput from '../components/LoginRegInput';
import ButtonComponent from '../components/ButtonComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Icon } from 'native-base';
import { xpost } from '../plugins/xcrud';
import FlashMessage from 'react-native-flash-message';
import { connect } from 'react-redux';
import InAppMessage from '../plugins/flash_message';
import { timeout } from '../plugins/globals';

class RegisterScreen extends React.Component {
    static navigationOptions = { header: null };

    constructor(props) {
        super(props);
        this.state = {
            isRegistering: false,
            isConnected: props.isConnected,
            inputFields: {
                Name: { type: 'Name', value: '', placeholder: 'Vardas' },
                SurName: { type: 'SurName', value: '', placeholder: 'Pavardė' },
                Gender: { type: 'Gender', value: '', placeholder: '' },
                CityId: { type: 'CityId', value: null, placeholder: 'Miestas', displayName: '' },
                Mail: { type: 'Mail', value: '', placeholder: 'El. Paštas' },
                Phone: { type: 'Phone', value: '', placeholder: 'Tel. Numeris' },
                Password: { type: 'Password', value: '', placeholder: 'Slaptažodis' },
                Password2: {
                    type: 'Password2',
                    value: '',
                    placeholder: 'Pakartoti slaptažodį',
                },
            },
        };
    }

    handleUserInput = (input, type, name) => {
        let tempFields = this.state.inputFields;
        tempFields[type].value = input;
        if (type === 'CityId') tempFields[type].displayName = name;
        this.setState({
            inputFields: tempFields,
        });
    };

    handleWrongInput = () => {
        let inputs = this.state.inputFields;
        if (!inputs.Name.value) {
            InAppMessage.showErrorWarning(this.refs.registerFlash, { message: 'Prašome įvesti savo vardą' });
        } else if (!inputs.SurName.value) {
            InAppMessage.showErrorWarning(this.refs.registerFlash, { message: 'Prašome įvesti savo pavardę' });
        } else if (!inputs.CityId.value) {
            InAppMessage.showErrorWarning(this.refs.registerFlash, { message: 'Prašome pasirinkti miestą' });
        } else if (!inputs.Mail.value) {
            InAppMessage.showErrorWarning(this.refs.registerFlash, { message: 'Prašome įvesti savo el. paštą' });
        } else if (!inputs.Password.value) {
            InAppMessage.showErrorWarning(this.refs.registerFlash, { message: 'Prašome įvesti slaptažodį' });
        } else if (!inputs.Password2.value) {
            InAppMessage.showErrorWarning(this.refs.registerFlash, { message: 'Prašome pakartoti įvestą slaptažodį' });
        } else if (inputs.Password.value !== inputs.Password2.value) {
            InAppMessage.showErrorWarning(this.refs.registerFlash, { message: 'Įvesti slaptažodžiai nesutampa' });
        }
    };

    validateInput = () => {
        let inputs = this.state.inputFields;
        if (
            inputs.CityId.value &&
            inputs.Mail.value &&
            inputs.Name.value &&
            inputs.SurName.value &&
            inputs.Password.value &&
            inputs.Password2.value
        ) {
            return true;
        } else {
            return false;
        }
    };

    registerUser = async () => {
        let inputCopy = Object.assign({}, this.state.inputFields);
        let fcmToken = await firebase.messaging().getToken();
        inputCopy.PhoneKey = { type: 'PhoneKey', value: fcmToken };

        this.setState({ isRegistering: true });
        Promise.race([timeout(), xpost(`${ROOT}/api/register`, inputCopy, this.refs.registerFlash)])
            .then(json => {
                if (json.success) {
                    InAppMessage.showCustomSuccess(this.refs.registerFlash, { title: 'Registracija sėkminga' });
                    this.setState({ isRegistering: false });
                    setTimeout(() => {
                        this.props.navigation.navigate('Login');
                    }, 1000);
                } else {
                    this.setState({ isRegistering: false });
                    InAppMessage.showErrorWarning(this.refs.registerFlash, { message: json.msg ? json.msg : 'Nežinoma klaida' });
                    return;
                }
            })
            .catch(error => {
                let errorDesc = 'Nežinoma klaida, bandykite dar kartą';
                if (error.msg) {
                    errorDesc = error.msg;
                } else if (error.message) {
                    if (error.message === 'Network request failed') {
                        errorDesc = 'Ryšio klaida, patikrinkite interneto prieigą';
                    } else {
                        errorDesc = error.message;
                    }
                }
                InAppMessage.showErrorWarning(this.refs.registerFlash, { message: errorDesc });
                this.setState({ isRegistering: false });
            });
    };

    render() {
        const { inputFields } = this.state;
        return (
            <LinearGradient colors={['#FF3D00', '#F21C43', '#F22184']} style={{ flex: 1 }}>
                <SafeAreaView>
                    <KeyboardAwareScrollView contentContainerStyle={{ zIndex: 0 }}>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('Login')}
                            style={{ flexDirection: 'row', margin: 10, alignItems: 'center', zIndex: 1, position: 'absolute' }}>
                            <Icon name="chevron-left" type="FontAwesome5" style={{ color: '#fff', marginRight: 10, fontSize: 20 }} />
                            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Mitr-Regular' }}>Atgal</Text>
                        </TouchableOpacity>
                        <View style={styles.logoContainer}>
                            <SvgLogo />
                        </View>

                        {Object.keys(inputFields).map((field, index) => {
                            return (
                                <View style={styles.svgComponentContainer} key={index.toString()}>
                                    <LoginRegInput
                                        fieldType={inputFields[field].type}
                                        value={inputFields[field].value}
                                        handleChange={this.handleUserInput}
                                        placeholder={inputFields[field].placeholder}
                                        btnStyle={{ justifyContent: 'center' }}
                                        displayName={field === 'CityId' ? inputFields[field].displayName : null}
                                        data={field === 'CityId' ? this.props.cities : null}
                                    />
                                </View>
                            );
                        })}
                        <ButtonComponent
                            handlePress={() => {
                                if (this.validateInput()) {
                                    this.registerUser();
                                } else {
                                    this.handleWrongInput();
                                }
                            }}
                            btnStyle={styles.registerScreenBtn}
                            isBusy={this.state.isRegistering}
                            btnTextStyle={styles.registerText}
                            btnText={'REGISTRUOTIS'}
                        />
                    </KeyboardAwareScrollView>
                </SafeAreaView>
                <FlashMessage ref="registerFlash" animated style={{ zIndex: 1 }} />
            </LinearGradient>
        );
    }
}

const mapStateToProps = state => {
    return {
        cities: state.cities.cities,
        isConnected: state.network.isConnected,
    };
};

export default connect(
    mapStateToProps,
    null,
)(RegisterScreen);
