# granule
🛩 A tiny GraphQL query component for React

*alpha, api's will probably change*

This was created as a lightweight (targeting <1KB, gziped) alternative to use on pages where Apollo and friends are too heavy for the job; namely smaller, read only components.

It tries to follow a few of the same conventions and names as Apollo, such as ingesting the GraphQL AST, fetchMore for pagination but operates as a component rather than a HOC.
