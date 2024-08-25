const Discord = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'roblox',
    description: 'Consulta o perfil de um jogador no Roblox',
    options: [
        {
            name: 'username',
            description: 'Nome de usuário do jogador no Roblox',
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (client, interaction) => {
        const username = interaction.options.getString('username');

        try {
            const userIdResponse = await axios.post('https://users.roblox.com/v1/usernames/users', {
                usernames: [username],
                excludeBannedUsers: true
            });

            if (!userIdResponse.data.data.length) {
                await interaction.reply({ content: `Usuário ${username} não encontrado.`, ephemeral: true });
                return;
            }

            const userId = userIdResponse.data.data[0].id;
            const profileResponse = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
            const profile = profileResponse.data;

            const avatarResponse = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
            const avatarUrl = avatarResponse.data.data[0].imageUrl;

            const creationDate = new Date(profile.created);
            const formattedDate = creationDate.toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const profileEmbed = new Discord.EmbedBuilder()
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setColor('#2c2f33')
                .setTitle(`Usuário encontrado`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setDescription(`**Nome de usuário:** ${profile.name}\n**Descrição:** ${profile.description || 'Nenhuma descrição.'}\n**Conta criada em:** ${formattedDate}`)
                .setThumbnail(avatarUrl)
                .setFooter({ text: 'Informações fornecidas pela API do Roblox' });

            await interaction.reply({ embeds: [profileEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ocorreu um erro ao tentar consultar o perfil do jogador.', ephemeral: true });
        }
    }
};
