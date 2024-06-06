
const substringTest = function(){
  let message = "## <@everyone>제목과 태그로 던전을 먼저 확인해요.\n"
      + "### 하단에 댓글로 <@1172437289339727913>을 맨션하면 자동으로 참여신청 돼요!\n"
      + "\n"
      + "### 현재 참가인원\n"
      + " - <@280290004926857216>\n"
      + " - <@1172398669828464641>\n";

  const findIndex = message.lastIndexOf("현재 참가인원")
  console.log(message.substring(0, findIndex + "현재 참가인원".length))
  let members = message.substring(findIndex + "현재 참가인원".length, message.length).replaceAll(" ", "").split("-")
  let participants = []
  for(let member of members){
    let memberId = member.replace(/\D/g, "")
    if(memberId !== ""){
      participants.push(memberId)
    }
  }
  console.log(participants)

  // console.log(index)
  // console.log(message.substring(0, index-6))
}

substringTest();