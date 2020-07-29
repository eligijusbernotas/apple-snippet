import { showMessage } from 'react-native-flash-message';

class InAppMessage {
    static showErrorWarning(ref, { message }) {
        ref.showMessage({
            message: 'Klaida',
            description: message,
            type: 'warning',
            icon: 'danger',
        });
    }

    static showCustomSuccess(ref, { title, message }) {
        ref.showMessage({
            message: title,
            description: message,
            type: 'success',
            icon: 'success',
        });
    }

    static showGlobalSuccess({ title, message }) {
        showMessage({
            message: title,
            description: message,
            type: 'success',
            icon: 'success',
        });
    }

    static showGlobalError({ title, message }) {
        showMessage({
            message: title,
            description: message,
            type: 'danger',
            icon: 'danger',
        });
    }
}

export default InAppMessage;
