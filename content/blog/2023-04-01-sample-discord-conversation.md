---
title: "Sample Discord Conversation"
author: "JohnDoe"
date: "2023-04-01T12:00:00Z"
tags: ["webdev", "javascript", "react"]
---

**JohnDoe:** Hey everyone, I've been working on a React project and I'm having trouble with state management. Has anyone tried Redux Toolkit?

**JaneSmith:** I've been using Redux Toolkit for a few months now and it's much better than plain Redux. The boilerplate is significantly reduced.

**JohnDoe:** That's good to hear. What I'm struggling with specifically is handling async operations. I've been using thunks but it feels a bit verbose.

**JaneSmith:** Have you considered using RTK Query? It's part of Redux Toolkit and handles all the loading states, caching, and data fetching for you.

**AlexBrown:** I second that. RTK Query is amazing for API calls. It automatically handles loading states, errors, and even caching. Here's a simple example:

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.example.com/' }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => `users`,
    }),
  }),
})

export const { useGetUsersQuery } = api
```

**JohnDoe:** Wow, that looks much cleaner than what I'm doing now. How would you handle more complex scenarios like dependent queries?

**AlexBrown:** For dependent queries, you can use the `skip` option:

```javascript
const { data: user } = useGetUserQuery(userId)
const { data: userPosts } = useGetUserPostsQuery(user?.id, {
  skip: !user?.id,
})
```

**JohnDoe:** This is super helpful! I'll refactor my code to use RTK Query. Thank you both for the advice.

**JaneSmith:** No problem! Let us know if you run into any issues. The Redux Toolkit docs are also excellent if you need more examples.

**JohnDoe:** Will do. It's great to have such a helpful community. #webdev #react #redux 