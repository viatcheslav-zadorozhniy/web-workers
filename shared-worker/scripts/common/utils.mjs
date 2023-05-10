const commentsUrl = 'https://jsonplaceholder.typicode.com/comments';

export const fetchComments = async () => {
  const response = await fetch(`${commentsUrl}?postId=1`);
  return await response.json();
};

export const addComment = async comment => {
  await fetch(commentsUrl, {
    method: 'POST',
    body: JSON.stringify(comment),
  });

  return comment;
};

export const createCommentHTML = comment => {
  return `<div class="card mb-3"><div class="card-body">${comment.body.trim()}</div></div>`;
};
