const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Carregar o token usando .env

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Variável de ambiente

// Configura o cliente GitHub
const githubClient = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
});

/**
 * Obtém repositórios de um usuário com filtro de linguagem
 * @param {string} username - Nome de usuário do GitHub
 * @returns {Promise<Repo[]>} - Lista de repositórios filtrados
 */
async function getFilteredRepos(username) {
  try {
    // Faz a solicitação para a API do GitHub
    const response = await githubClient.get(`/users/${username}/repos`, {
      params: { sort: 'created', direction: 'asc'}
    });

    const repos = response.data;
    return repos.reduce((acc, repo) => {
      if (repo.language === 'C#' && acc.length < 5) {
        acc.push({
          title: repo.name,
          description: repo.description,
        });
      }
      return acc;
    }, []);
  } catch (error) {
    const errorMessage = error.response ? error.response.data.message : error.message;
    throw new Error(errorMessage);
  }
}

app.get('/repos/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const repos = await getFilteredRepos(username);
    res.json(repos);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});