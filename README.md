# Crypto Towns Naive Bot

A naive bot implementation for cryptotowns.xyz.

This project is intended to highlight possibilities for botting and the expectation is that these opportunities will be closed by the developer. This project SHOULD stop working at any moment.

## Build and run locally

Install dependencies once:

```
yarn install
```

Configure environment variables once.

Copy `env.example` to `.env` and popuate your own values.

Run the app with:

```
yarn start
```

## Deploying

The repository is already set up for deploy to kubernetes. 

Make sure you have werf cli installed: https://werf.io/installation.html

Configure secret values once.

Copy `clear-values.yaml.example` to `clear-values.yaml` and populate your own values.

Run the following to generate a secret key and encrypt your settings.

```
werf helm secret generate-secret-key | tr -d '\n' >  .werf_secret_key
werf helm secret values encrypt clear-values.yaml -o .helm/secret-values.yaml
```

Set the following two secrets on your github repo:

Secret Name|Description
---|---
WERF_SECRET_KEY|The contents of .werf_secret_key in the root of your project
KUBE_CONFIG_BASE64_DATA|The output of `doctl kubernetes cluster kubeconfig show <config name> | base64` if using digital ocean

If you have the Github and Digital Ocean CLIs installed you can do this as follows:

```
gh secret set WERF_SECRET_KEY --repos=\"$(git remote get-url origin)\" < .werf_secret_key
gh secret set KUBE_CONFIG_BASE64_DATA --repos=\"$(git remote get-url origin)\" -b$(doctl kubernetes cluster kubeconfig show ekp | base64)
```

Commit your changes and push to `main` branch. The github action in this repo will perform the deploy with werf.

