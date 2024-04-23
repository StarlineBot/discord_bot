module.exports = async (message) => {
  try {
    await message.guild.members.fetch();
  } catch (err) {
    console.error(err);
  }
}