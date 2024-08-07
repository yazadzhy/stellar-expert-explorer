import deepMerge from 'deepmerge'
import {setStellarNetwork, getCurrentStellarNetwork} from '@stellar-expert/ui-framework'
import appConfig from './app.config.json'

class AppSettings {
    constructor(clientConfig) {
        let config = appConfig
        if (clientConfig) {
            config = deepMerge(config, clientConfig)
        }
        for (const key of Object.keys(config)) {
            this[key] = config[key]
        }

        const networkFromUrl = ((/^\/(?:\w+)\/(\w+)/i.exec(location.pathname) || [])[1] || '').toLowerCase()
        const networks = Object.keys(this.networks)
        setStellarNetwork(networks.includes(networkFromUrl) ? networkFromUrl : networks[0])
    }

    directoryAdmins

    apiEndpoint

    templateServer

    networks

    oauth

    turnstileKey

    get activeNetwork() {
        return getCurrentStellarNetwork()
    }

    get networkSettings() {
        const networkName = getCurrentStellarNetwork()
        let res = this.networks[networkName]
        if (!res) {
            res = this.networks.public
        }
        return res
    }

    get networkPassphrase() {
        return this.networkSettings.passphrase
    }

    get horizonUrl() {
        return this.networkSettings.horizon
    }
}

const appSettings = new AppSettings(window.clientConfig)

export default appSettings
